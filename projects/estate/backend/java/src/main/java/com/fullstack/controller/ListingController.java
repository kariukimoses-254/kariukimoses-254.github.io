package com.fullstack.controller;

import com.fullstack.model.Customer;
import com.fullstack.model.Listing;
import com.fullstack.service.EstateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ListingController {

    private final EstateService estateService;

    public ListingController(EstateService estateService) {
        this.estateService = estateService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "Java Spring Boot REST API",
                "database", "MySQL",
                "health", "ok"
        );
    }

    @GetMapping("/listings")
    public List<Listing> getAllListings() {
        return estateService.findAllListings();
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<Listing> getListing(@PathVariable Long id) {
        Listing listing = estateService.findListing(id);
        return listing != null ? ResponseEntity.ok(listing) : ResponseEntity.notFound().build();
    }

    @PostMapping("/listings")
    public ResponseEntity<Listing> createListing(@RequestBody Listing listing) {
        return ResponseEntity.status(201).body(estateService.createListing(listing));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<Listing> updateListing(@PathVariable Long id, @RequestBody Listing listing) {
        Listing updated = estateService.updateListing(id, listing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id) {
        estateService.deleteListing(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/customers")
    public List<Customer> getAllCustomers() {
        return estateService.findAllCustomers();
    }

    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.status(201).body(estateService.createCustomer(customer));
    }
}