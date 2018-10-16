<?php require_once 'init.php'; ?>
<?php if (!securePage($_SERVER['PHP_SELF'])){die();} ?>
<?php
// Get token for verifying form submission

if (!empty($_GET['mode'])) {
    if ($_GET['mode'] == "pattern") {
        $token = LDSToken::generate('pattern');
        echo $token;
    }
} else {
    $token = Token::generate();
    echo $token;
}
