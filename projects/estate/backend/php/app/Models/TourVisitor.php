<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TourVisitor extends Model
{
    use HasFactory;

    protected $connection = 'mysql';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'preferred_tour_time',
        'property_interest',
    ];

    protected $casts = [
        'preferred_tour_time' => 'datetime',
    ];
}