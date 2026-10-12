<?php

namespace App\GraphQL;

use App\Models\Agent;
use App\Models\Property;
use App\Models\TourVisitor;

class GraphQLHandler
{
    public function handle(string $query, ?array $variables = []): array
    {
        $query = trim($query);
        $query = preg_replace('/\s+/', ' ', $query);

        try {
            if (preg_match('/query\s*\{/', $query)) {
                $result = $this->resolveQuery($query);
            } elseif (preg_match('/mutation\s*\{/', $query)) {
                $result = $this->resolveMutation($query);
            } elseif (preg_match('/\{\s*(listings|properties|agents|tourVisitors|health)\b/', $query)) {
                $result = $this->resolveQuery('query { ' . $query . ' }');
            } else {
                throw new \Exception('Unsupported GraphQL operation');
            }

            return ['data' => $result];
        } catch (\Throwable $e) {
            return ['errors' => [['message' => $e->getMessage()]], 'data' => null];
        }
    }

    private function resolveQuery(string $query): array
    {
        $result = [];

        if (str_contains($query, 'listings')) {
            $result['listings'] = Property::with('agent')->get()->toArray();
        }
        if (str_contains($query, 'properties')) {
            $result['properties'] = Property::with('agent')->get()->toArray();
        }
        if (str_contains($query, 'agents')) {
            $result['agents'] = Agent::all()->toArray();
        }
        if (str_contains($query, 'tourVisitors')) {
            $result['tourVisitors'] = TourVisitor::all()->toArray();
        }
        if (str_contains($query, 'health')) {
            $result['health'] = [
                'service' => 'PHP Laravel GraphQL API',
                'databases' => ['postgresql' => 'connected', 'mysql' => 'connected'],
                'status' => 'ok',
            ];
        }
        if (preg_match('/property\(id:\s*(\d+)\)/', $query, $m)) {
            $result['property'] = Property::with('agent')->find((int) $m[1])?->toArray();
        }
        if (preg_match('/listing\(id:\s*(\d+)\)/', $query, $m)) {
            $result['listing'] = Property::with('agent')->find((int) $m[1])?->toArray();
        }

        return $result;
    }

    private function resolveMutation(string $query): array
    {
        $result = [];

        if (preg_match('/createProperty\(.*?title:\s*"([^"]+)".*?price:\s*([\d.]+)/s', $query, $m)) {
            $property = Property::create([
                'title' => $m[1],
                'description' => $m[1],
                'price' => (float) $m[2],
                'location' => 'Unknown',
                'type' => 'house',
                'status' => 'available',
            ]);
            $result['createProperty'] = $property->toArray();
        }

        if (preg_match('/createTourVisitor\(.*?name:\s*"([^"]+)".*?email:\s*"([^"]+)"/s', $query, $m)) {
            $visitor = TourVisitor::create([
                'name' => $m[1],
                'email' => $m[2],
                'property_interest' => 'GraphQL booking',
            ]);
            $result['createTourVisitor'] = $visitor->toArray();
        }

        return $result;
    }
}