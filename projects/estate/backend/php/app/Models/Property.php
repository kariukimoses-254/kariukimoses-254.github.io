<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    use HasFactory;

    protected $connection = 'pgsql';

    protected $fillable = [
        'title',
        'description',
        'price',
        'location',
        'type',
        'bedrooms',
        'bathrooms',
        'area',
        'status',
        'agent_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'area' => 'decimal:2',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}