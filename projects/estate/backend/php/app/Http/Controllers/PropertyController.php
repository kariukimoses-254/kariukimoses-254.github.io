<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Property::with('agent');

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }
        if ($request->has('q')) {
            $query->where('title', 'ilike', '%' . $request->input('q') . '%');
        }

        return response()->json($query->paginate($request->input('per_page', 20)));
    }

    public function show(int $id): JsonResponse
    {
        $property = Property::with('agent')->find($id);
        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }
        return response()->json($property);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string',
            'type' => 'required|in:house,apartment,land,commercial',
            'bedrooms' => 'integer|min:0',
            'bathrooms' => 'integer|min:0',
            'area' => 'numeric|min:0',
            'status' => 'in:available,sold,pending',
            'agent_id' => 'exists:agents,id',
        ]);

        $property = Property::create($validated);
        return response()->json($property->load('agent'), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $property = Property::find($id);
        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'price' => 'numeric|min:0',
            'location' => 'string',
            'type' => 'in:house,apartment,land,commercial',
            'bedrooms' => 'integer|min:0',
            'bathrooms' => 'integer|min:0',
            'area' => 'numeric|min:0',
            'status' => 'in:available,sold,pending',
            'agent_id' => 'exists:agents,id',
        ]);

        $property->update($validated);
        return response()->json($property->load('agent'));
    }

    public function destroy(int $id): JsonResponse
    {
        $property = Property::find($id);
        if (!$property) {
            return response()->json(['error' => 'Property not found'], 404);
        }
        $property->delete();
        return response()->json(['message' => 'Property deleted'], 200);
    }
}