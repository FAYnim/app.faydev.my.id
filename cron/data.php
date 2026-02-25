<?php
    include "db.php";
    $data = json_decode(file_get_contents("https://panel.faydev.my.id/data/app-config.json"), 1);
    // print_r($data);
    // print_r($data);

    foreach($data["projects"] as $projects):
        echo $projects;
    endforeach;
?>