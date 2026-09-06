<?php
$base = __DIR__ . '/backend';

// Directories
$dirs = [
    'Models/MenuManagement',
    'Http/Controllers/Api/MenuManagement/Categories',
    'Http/Controllers/Api/MenuManagement/Items',
    'Http/Controllers/Api/MenuManagement/Addons',
    'Http/Controllers/Api/MenuManagement/Orchestrators',
];
foreach ($dirs as $d) {
    @mkdir("$base/app/$d", 0777, true);
}

function moveAndNamespace($oldPath, $newPath, $newNamespace) {
    global $base;
    $fullOld = "$base/app/$oldPath";
    $fullNew = "$base/app/$newPath";
    if (file_exists($fullOld)) {
        $content = file_get_contents($fullOld);
        // Replace namespace line
        $content = preg_replace('/namespace\s+App[^;]+;/', "namespace App\\$newNamespace;", $content);
        file_put_contents($fullNew, $content);
        unlink($fullOld);
    }
}

// Models
$models = ['Addon', 'AddonCategory', 'AddonRecipe', 'MenuCategory', 'MenuItem', 'MenuItemPrice', 'MenuRecipe'];
foreach ($models as $m) {
    moveAndNamespace("Models/$m.php", "Models/MenuManagement/$m.php", "Models\\MenuManagement");
}

// Controllers
$controllers = [
    'MenuCategoryController' => ['MenuManagement/Categories/MenuCategoryController.php', 'Http\\Controllers\\Api\\MenuManagement\\Categories'],
    'MenuItemController' => ['MenuManagement/Items/MenuItemController.php', 'Http\\Controllers\\Api\\MenuManagement\\Items'],
    'MenuItemPriceController' => ['MenuManagement/Items/MenuItemPriceController.php', 'Http\\Controllers\\Api\\MenuManagement\\Items'],
    'MenuRecipeController' => ['MenuManagement/Items/MenuRecipeController.php', 'Http\\Controllers\\Api\\MenuManagement\\Items'],
    'AddonController' => ['MenuManagement/Addons/AddonController.php', 'Http\\Controllers\\Api\\MenuManagement\\Addons'],
    'AddonCategoryController' => ['MenuManagement/Addons/AddonCategoryController.php', 'Http\\Controllers\\Api\\MenuManagement\\Addons'],
    'AddonRecipeController' => ['MenuManagement/Addons/AddonRecipeController.php', 'Http\\Controllers\\Api\\MenuManagement\\Addons'],
    'Menu/MenuAddController' => ['MenuManagement/Orchestrators/MenuAddController.php', 'Http\\Controllers\\Api\\MenuManagement\\Orchestrators'],
    'Menu/MenuEditController' => ['MenuManagement/Orchestrators/MenuEditController.php', 'Http\\Controllers\\Api\\MenuManagement\\Orchestrators'],
    'Menu/AddonAddController' => ['MenuManagement/Orchestrators/AddonAddController.php', 'Http\\Controllers\\Api\\MenuManagement\\Orchestrators'],
    'Menu/AddonEditController' => ['MenuManagement/Orchestrators/AddonEditController.php', 'Http\\Controllers\\Api\\MenuManagement\\Orchestrators'],
];
foreach ($controllers as $old => $info) {
    moveAndNamespace("Http/Controllers/Api/$old.php", "Http/Controllers/Api/{$info[0]}", $info[1]);
}

// Now update all usages in all files inside app/ and routes/
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator("$base/app"));
$phpFiles = [];
foreach ($files as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') $phpFiles[] = $file->getPathname();
}
$phpFiles[] = "$base/routes/api.php";

foreach ($phpFiles as $f) {
    $c = file_get_contents($f);
    
    // Replace model uses
    foreach ($models as $m) {
        $c = str_replace("use App\\Models\\$m;", "use App\\Models\\MenuManagement\\$m;", $c);
    }
    
    // Replace controller uses in routes/api.php
    $c = str_replace("use App\\Http\\Controllers\\Api\\MenuCategoryController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Categories\\MenuCategoryController;", $c);
    $c = str_replace("use App\\Http\\Controllers\\Api\\MenuItemController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Items\\MenuItemController;", $c);
    $c = str_replace("use App\\Http\\Controllers\\Api\\AddonController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Addons\\AddonController;", $c);
    
    $c = str_replace("use App\\Http\\Controllers\\Api\\Menu\\MenuAddController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Orchestrators\\MenuAddController;", $c);
    $c = str_replace("use App\\Http\\Controllers\\Api\\Menu\\MenuEditController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Orchestrators\\MenuEditController;", $c);
    $c = str_replace("use App\\Http\\Controllers\\Api\\Menu\\AddonAddController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Orchestrators\\AddonAddController;", $c);
    $c = str_replace("use App\\Http\\Controllers\\Api\\Menu\\AddonEditController;", "use App\\Http\\Controllers\\Api\\MenuManagement\\Orchestrators\\AddonEditController;", $c);

    file_put_contents($f, $c);
}
@rmdir("$base/app/Http/Controllers/Api/Menu");
echo "Refactoring Complete!\n";
