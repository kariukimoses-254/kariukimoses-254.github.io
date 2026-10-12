<?php

namespace App\Http\Controllers;

use App\Models\TourVisitor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VisitorController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(TourVisitor::latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:tour_visitors,email',
            'phone' => 'nullable|string|max:20',
            'preferred_tour_time' => 'nullable|date',
            'property_interest' => 'nullable|string|max:255',
        ]);

        $visitor = TourVisitor::create($validated);
        return response()->json($visitor, 201);
    }
}