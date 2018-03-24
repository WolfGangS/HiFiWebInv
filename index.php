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

function startsWith($haystack, $needle) {
	$length = strlen($needle);
	return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle) {
	$length = strlen($needle);

	return $length === 0 ||
		(substr($haystack, -$length) === $needle);
}

$url = parse_url(curPageURL());

if (empty($url["path"])) {
	die();
}

//$path = explode('.', $url["path"]);

//$file = count($path) > 1 ? $path[1] : null;

$path = "inv" . $url["path"];
while (substr($path, strlen($path) - 1) == "/") {
	$path = substr($path, 0, strlen($path) - 1);
}

$path = explode('/', $path);

$_path = [];

foreach ($path as $p) {
	if (substr($p, 0, 1) != ".") {
		$_path[] = $p;
	}
}

$path = implode("/", $_path);

$response = ["path" => $path];

switch ($_SERVER['REQUEST_METHOD']) {
case 'GET':
	if (is_dir($path)) {
		$path .= "/";
		$_contents = scandir($path);
		$contents = [];
		$finfo = finfo_open(FILEINFO_MIME_TYPE);
		foreach ($_contents as $item) {
			if (substr($item, 0, 1) == ".") {
				continue;
			}

			if (is_file($path . $item)) {
				$contents["files"][$item] = finfo_file($finfo, $path . $item);
			} else {
				$contents["dirs"][] = $item;
			}
		}
		finfo_close($finfo);
		$response["dir"] = $contents;
	} else if (is_file($path)) {
		$finfo = finfo_open(FILEINFO_MIME_TYPE);
		$type = finfo_file($finfo, $path);
		finfo_close($finfo);

		if ($type != "text/plain") {
			header('Content-Description: File Transfer');
			header('Content-Type: application/octet-stream');
			header('Content-Disposition: attachment; filename="' . basename($path) . '"');
			header('Expires: 0');
			header('Cache-Control: must-revalidate');
			header('Pragma: public');
			header('Content-Length: ' . filesize($path));
		}
		if (endsWith($path, ".json")) {
			header('Content-Type: application/json');
		}
		readfile($path);
		die();
	}
	break;
}
header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);