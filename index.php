<pre>
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

//$path = explode('.', $url["path"]);

//$file = count($path) > 1 ? $path[1] : null;

$path = "inv" . $url["path"];
while (substr($path, strlen($path) - 1) == "/") {
	$path = substr($path, 0, strlen($path) - 1);
}

print_r($path);

echo "\n";

$response = [];

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
		$response["file"] = finfo_file($finfo, $path);
		finfo_close($finfo);
	}
	break;
}
print_r($response);
?>
</pre>