<?php

if ($_SERVER["REMOTE_HOST"] != "80.229.27.32") {
	die();
}

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

function base64url_encode($data) {
	return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
	return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}

function pathclean($path) {
	$path = trim($path, "/");
	$_path = [];
	$path = explode("/", $path);
	foreach ($path as $p) {
		if (!empty($p) && substr($p, 0, 1) != ".") {
			$_path[] = $p;
		}
	}
	return implode("/", $_path);
}

$url = parse_url(curPageURL());

if (empty($url["path"])) {
	die();
}

//$path = explode('.', $url["path"]);

//$file = count($path) > 1 ? $path[1] : null;

$path = pathclean($url["path"]);

$_path = explode('/', $path);

$action = empty($_path[0]) ? "" : $_path[0];

$response = [];
$rp = $path;
$path = "inv/" . $path;

switch ($_SERVER['REQUEST_METHOD']) {
case 'GET':
	if (is_dir($path)) {
		$path .= "/";
		if (strlen($rp) > 0) {
			$rp .= "/";
		}
		$_contents = scandir($path);
		$contents = [];
		$finfo = finfo_open(FILEINFO_MIME_TYPE);
		$record = [
			"id" => null,
			"text" => "n/a",
			//"icon"	=> "icon",
			"state" => [
				"opened" => false, // is the node open
				"disabled" => false, // is the node disabled
				"selected" => false,
			],
			//"children"	=> [],
			"li_attr" => [],
			"a_attr" => [],
		];

		foreach ($_contents as $item) {
			if (substr($item, 0, 1) == ".") {
				continue;
			}
			$_r = $record;
			$_r["id"] = base64url_encode($path . $item);
			$_r["text"] = $item;
			$_r["data"]["path"] = $rp . $item;
			$_r["data"]["name"] = $item;
			if (is_file($path . $item)) {
				$_r["type"] = "file";
				$type = finfo_file($finfo, $path . $item);
				$_r["data"]["type"] = $type;
				$_r["children"] = false;
			} else {
				$_r["type"] = "folder";
				$_r["children"] = true;
			}
			$contents[] = $_r;
		}
		finfo_close($finfo);
		$response = $contents;
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
case "POST":
	$response["action"] = $action;
	$response["status"] = "failure";
	$response["post"] = $_POST;
	switch ($action) {
	case 'upload':
		if (!empty($_FILES["fileupload"])) {
			$fu = $_FILES["fileupload"];
			if (!empty($fu["name"])) {
				if (!empty($fu["tmp_name"])) {
					if (!file_exists('inv/uploads')) {
						mkdir("inv/uploads", 0755, true);
					}
					move_uploaded_file($fu["tmp_name"], "inv/uploads/" . $fu["name"]);
				}
			}
		}
		break;
	case 'rename':
		if (!empty($_POST["oldpath"]) && !empty($_POST["newpath"])) {
			$op = "inv/" . pathclean($_POST["oldpath"], "/");
			$np = "inv/" . pathclean($_POST["newpath"], "/");
			if (file_exists($op)) {
				if (!file_exists($np)) {
					if (rename($op, $np)) {
						$response["status"] = "success";
					} else {
						$response["message"] = "Rename failed";
					}
				} else {
					$response["message"] = "File with that name already exists";
				}
			} else {
				$response["message"] = "File does not exist";
			}
		} else {
			$response["message"] = "Missing parameters";
		}
		break;
	case 'copy':
		$response["post"] = $_POST;
		break;
	case 'delete':
		if (!empty($_POST["path"])) {
			$op = "inv/" . pathclean($_POST["path"], "/");
			$np = "inv/trash/" . basename($path);
			if (file_exists($op)) {
				if (!file_exists($np)) {
					if (rename($op, $np)) {
						$response["status"] = "success";
					} else {
						$response["message"] = "Rename failed";
					}
				} else {
					$response["message"] = "File with that name already exists";
				}
			} else {
				$response["message"] = "File does not exist";
			}
		} else {
			$response["message"] = "Missing parameters";
		}
		break;
	default:
		$response["message"] = "Unrecognized action";
		break;
	}
	break;
}
header('Content-Type: application/json');
echo json_encode($response, JSON_PRETTY_PRINT);