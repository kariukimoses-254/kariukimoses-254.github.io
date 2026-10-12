<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'service' => 'PHP Laravel REST API',
        'database' => 'PostgreSQL + MySQL',
        'health' => 'ok',
    ]);
});

Route::get('/properties', [App\Http\Controllers\PropertyController::class, 'index']);
Route::get('/properties/{id}', [App\Http\Controllers\PropertyController::class, 'show']);
Route::post('/properties', [App\Http\Controllers\PropertyController::class, 'store']);
Route::put('/properties/{id}', [App\Http\Controllers\PropertyController::class, 'update']);
Route::delete('/properties/{id}', [App\Http\Controllers\PropertyController::class, 'destroy']);

Route::get('/tour-visitors', [App\Http\Controllers\VisitorController::class, 'index']);
Route::post('/tour-visitors', [App\Http\Controllers\VisitorController::class, 'store']);