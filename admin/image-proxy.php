<?php
declare(strict_types=1);

function outputPlaceholderImage(): void
{
    header('Content-Type: image/svg+xml; charset=UTF-8');
    header('Cache-Control: public, max-age=300');
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">'
        . '<rect width="320" height="220" fill="#f3f4f6"/>'
        . '<g fill="#9ca3af">'
        . '<rect x="86" y="92" width="148" height="46" rx="7"/>'
        . '<circle cx="118" cy="150" r="14"/>'
        . '<circle cx="202" cy="150" r="14"/>'
        . '</g>'
        . '<text x="160" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">Image unavailable</text>'
        . '</svg>';
    echo $svg;
}

$rawPath = isset($_GET['path']) ? trim((string)$_GET['path']) : '';
if ($rawPath === '') {
    outputPlaceholderImage();
    exit;
}

if (preg_match('#^(https?:)?//#i', $rawPath) || str_starts_with($rawPath, 'data:')) {
    outputPlaceholderImage();
    exit;
}

$normalized = str_replace('\\', '/', $rawPath);
$normalized = explode('?', $normalized)[0];
$normalized = explode('#', $normalized)[0];
$normalized = preg_replace('#^\./#', '', $normalized);
$normalized = ltrim((string)$normalized, '/');

if (str_starts_with($normalized, 'uploads/')) {
    $normalized = substr($normalized, strlen('uploads/'));
}

if (str_contains($normalized, '/uploads/')) {
    $parts = explode('/uploads/', $normalized);
    $normalized = end($parts) ?: '';
}

$segments = array_filter(explode('/', $normalized), static function (string $segment): bool {
    if ($segment === '' || $segment === '.' || $segment === '..') {
        return false;
    }
    return true;
});

if (empty($segments)) {
    outputPlaceholderImage();
    exit;
}

$uploadsDir = realpath(__DIR__ . '/../uploads');
if ($uploadsDir === false) {
    outputPlaceholderImage();
    exit;
}

$relativePath = implode(DIRECTORY_SEPARATOR, $segments);
$targetPath = $uploadsDir . DIRECTORY_SEPARATOR . $relativePath;
$targetRealPath = realpath($targetPath);

if ($targetRealPath === false || !str_starts_with($targetRealPath, $uploadsDir) || !is_file($targetRealPath)) {
    outputPlaceholderImage();
    exit;
}

$mimeType = mime_content_type($targetRealPath) ?: 'application/octet-stream';
if (!str_starts_with($mimeType, 'image/')) {
    outputPlaceholderImage();
    exit;
}

header('Content-Type: ' . $mimeType);
header('Content-Length: ' . (string)filesize($targetRealPath));
header('Cache-Control: public, max-age=86400');
readfile($targetRealPath);
