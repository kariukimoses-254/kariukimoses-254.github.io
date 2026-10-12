<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Property;

class PropertyAnalyticsService
{
    public function summaryStats(): array
    {
        return [
            'total_properties' => Property::count(),
            'available_properties' => Property::where('status', 'available')->count(),
            'sold_properties' => Property::where('status', 'sold')->count(),
            'pending_properties' => Property::where('status', 'pending')->count(),
            'avg_price' => round(Property::avg('price') ?? 0, 2),
            'total_agents' => Agent::count(),
        ];
    }

    public function byType(): array
    {
        return Property::select('type')
            ->selectRaw('count(*) as count')
            ->groupBy('type')
            ->get()
            ->toArray();
    }
}