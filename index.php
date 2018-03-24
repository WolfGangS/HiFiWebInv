<?php

function curPageURL() {
	$pageURL = 'http';
	$https = false;
	if ($_SERVER["HTTPS"] == "on") {
		$pageURL .= "s";
		$https = true;
	}
	$pageURL .= "://" . $_SERVER["SERVER_NAME"];
	if ($_SERVER["SERVER_PORT"] != ($https ? "443" : "80")) {
		$pageURL .= ":" . $_SERVER["SERVER_PORT"];
	}
	$pageURL .= $_SERVER["REQUEST_URI"];
	return $pageURL;
}

$url = parse_url(curPageURL());

if (empty($url["path"])) {
	die();
}

$path = explode('.', $url["path"]);

$file = count($path) > 1 ? $path[1] : null;

$path = "inv/" . $path[0];

switch ($_SERVER['REQUEST_METHOD']) {
case 'GET':
	if (is_dir($path)) {
		print_r(scandir($path));
	} else if (is_file($path)) {
		echo $path;
	}
	break;
}