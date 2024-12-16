<?php
// Encryption.php
class Encryption {
private $key;
private $cipher = "aes-256-gcm";
private $tag_length = 16;

public function __construct($key = null) {
if ($key === null) {
$this->key = getenv('ENCRYPTION_KEY') ?: 'your-secure-key-here';
} else {
$this->key = $key;
}
}

public function encrypt($data) {
$iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($this->cipher));
$tag = "";

$encrypted = openssl_encrypt(
$data,
$this->cipher,
$this->key,
OPENSSL_RAW_DATA,
$iv,
$tag,
"",
$this->tag_length
);

return base64_encode($iv . $tag . $encrypted);
}

public function decrypt($data) {
$data = base64_decode($data);

$iv_length = openssl_cipher_iv_length($this->cipher);
$iv = substr($data, 0, $iv_length);
$tag = substr($data, $iv_length, $this->tag_length);
$encrypted = substr($data, $iv_length + $this->tag_length);

return openssl_decrypt(
$encrypted,
$this->cipher,
$this->key,
OPENSSL_RAW_DATA,
$iv,
$tag
);
}
}