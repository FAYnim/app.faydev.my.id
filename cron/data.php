<?php
    include "db.php";
    $db = new Database();
    $conn = $db->getConnection();

    // Fetch data from external API
    $apiData = json_decode(file_get_contents("https://panel.faydev.my.id/data/app-config.json"), 1);
    
    $projectsData = [];
    
    foreach($apiData["projects"] as $slug):
        // Query database for project details
        $sql = $db->select("projects", "*", ["slug" => $slug]);
        
        if (!empty($sql)) {
            $project = $sql[0];
            $project_id = $project["id"];

            $sql_project_categories = $db->select("project_categories", "*", ["project_id" => $project_id]);
            if (!empty($sql_project_categories)) {
                $project_categories_id = $sql_project_categories[0]["category_id"];
                $sql_categories = $db->select("categories", "*", ["id" => $project_categories_id]);

                if (!empty($sql_categories)) {
                    $categories = $sql_categories[0]["name"];
                    $projectsData[] = [
                        "id" => $project['slug'],
                        "name" => $project['name'],
                        "description" => $project['description'],
                        "logo" => $project['logo'] ?? '',
                        "url" => $project['demo_url'],
                        "techStack" => [],
                        "category" => $categories,
                        "status" => $project['status']
                    ];
                }
            }
            
        }
    endforeach;

    // Write to data.json
    $jsonData = json_encode($projectsData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    file_put_contents(__DIR__ . "/../data.json", $jsonData);
    
    echo "Data successfully updated!\n\n";
    print_r($projectsData);
?>