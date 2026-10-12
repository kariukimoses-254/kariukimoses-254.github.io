<?php

use App\Models\Agent;
use App\Models\Property;
use App\Models\TourVisitor;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $agents = collect([
            ['name' => 'Rachel Adams', 'email' => 'rachel@estate.dev', 'phone' => '+1-555-0401', 'license' => 'TX-10101'],
            ['name' => 'David Kim', 'email' => 'david@estate.dev', 'phone' => '+1-555-0402', 'license' => 'TX-10102'],
            ['name' => 'Sophie Laurent', 'email' => 'sophie@estate.dev', 'phone' => '+1-555-0403', 'license' => 'CA-8899'],
        ])->map(fn (array $agent) => Agent::create($agent));

        $properties = [
            [
                'title' => 'Hilltop Estate with Views',
                'description' => 'Grand estate on a hilltop with panoramic valley views.',
                'price' => 3200000,
                'location' => 'Beverly Hills, CA',
                'type' => 'house',
                'bedrooms' => 7,
                'bathrooms' => 8,
                'area' => 8900,
                'agent_id' => $agents[0]->id,
            ],
            [
                'title' => 'Urban Condo with Amenities',
                'description' => 'Modern condo with rooftop pool and gym access.',
                'price' => 540000,
                'location' => 'Chicago, IL',
                'type' => 'apartment',
                'bedrooms' => 2,
                'bathrooms' => 2,
                'area' => 1150,
                'agent_id' => $agents[1]->id,
            ],
            [
                'title' => 'Developer Land Parcel',
                'description' => 'Zoned for mixed-use development, high ROI potential.',
                'price' => 780000,
                'location' => 'Phoenix, AZ',
                'type' => 'land',
                'bedrooms' => 0,
                'bathrooms' => 0,
                'area' => 42000,
                'agent_id' => $agents[2]->id,
            ],
        ];

        foreach ($properties as $property) {
            Property::create($property);
        }

        $visitors = [
            [
                'name' => 'Grace Park',
                'email' => 'grace@example.com',
                'phone' => '+1-555-0501',
                'preferred_tour_time' => now()->addDays(3),
                'property_interest' => 'Beverly Hills estate',
            ],
            [
                'name' => 'Liam Foster',
                'email' => 'liam@example.com',
                'phone' => '+1-555-0502',
                'preferred_tour_time' => now()->addDays(5),
                'property_interest' => 'Chicago condo',
            ],
        ];

        foreach ($visitors as $visitor) {
            TourVisitor::create($visitor);
        }
    }
}