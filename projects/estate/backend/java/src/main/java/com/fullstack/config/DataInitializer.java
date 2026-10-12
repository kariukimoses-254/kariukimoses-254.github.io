package com.fullstack.config;

import com.fullstack.model.Agent;
import com.fullstack.model.Customer;
import com.fullstack.model.Listing;
import com.fullstack.repository.AgentRepository;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.ListingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(ListingRepository listingRepo,
                               AgentRepository agentRepo,
                               CustomerRepository customerRepo) {
        return args -> {
            if (listingRepo.count() == 0) {
                listingRepo.saveAll(java.util.List.of(
                        new Listing("Beachfront Villa", "Luxury villa with private beach access and infinity pool.",
                                1890000, "Miami, FL", "available", 5, 6, 5200.0),
                        new Listing("Downtown Studio", "Cozy studio in the vibrant arts district.",
                                195000, "Nashville, TN", "available", 1, 1, 480.0),
                        new Listing("Suburban Family Home", "Warm family home near top-rated schools.",
                                425000, "Denver, CO", "pending", 3, 2, 1850.0),
                        new Listing("Rustic Farmhouse", "Charming farmhouse on 5 acres of open land.",
                                580000, "Nashville, TN", "sold", 4, 3, 2200.0)
                ));
            }
            if (agentRepo.count() == 0) {
                agentRepo.saveAll(java.util.List.of(
                        new Agent("Isabella Torres", "isabella@estate.dev", "+1-555-0201", "Luxury Homes"),
                        new Agent("Marcus Webb", "marcus@estate.dev", "+1-555-0202", "Waterfront Properties")
                ));
            }
            if (customerRepo.count() == 0) {
                customerRepo.saveAll(java.util.List.of(
                        new Customer("Olivia Bennett", "olivia@example.com", "+1-555-0301", "waterfront, 4+ bedrooms"),
                        new Customer("Noah Sullivan", "noah@example.com", "+1-555-0302", "condo, downtown, 2 bedrooms")
                ));
            }
            System.out.println("[Java API] Seed data loaded into MySQL");
        };
    }
}