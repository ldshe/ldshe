<?php

require_once 'init.php';
require_once __DIR__.'/includes/page_header.php';

const TEMPLATE = 'design';

register_shutdown_function($on_die, TEMPLATE);

if (securePage($_SERVER['PHP_SELF'])){
    //Prevent the shutdown function from executing the follow up action
    define('DIE_NOT_CALLED', true);
    $user = new User;
    $data = $user->data();
    $userData = [
        id => $data->id,
        email => $data->email,
        fname => $data->fname,
        lanme => $data->lname,
    ];
    $render_view(TEMPLATE, [
        'user_data' => json_encode($userData),
    ]);
}
