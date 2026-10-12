package com.fullstack.service;

import com.fullstack.model.Customer;
import com.fullstack.model.Listing;
import com.fullstack.repository.CustomerRepository;
import com.fullstack.repository.ListingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EstateService {

    private final ListingRepository listingRepository;
    private final CustomerRepository customerRepository;

    public EstateService(ListingRepository listingRepository, CustomerRepository customerRepository) {
        this.listingRepository = listingRepository;
        this.customerRepository = customerRepository;
    }

    public List<Listing> findAllListings() {
        return listingRepository.findAll();
    }

    public Listing findListing(Long id) {
        return listingRepository.findById(id).orElse(null);
    }

    public Listing createListing(Listing listing) {
        return listingRepository.save(listing);
    }

    public Listing updateListing(Long id, Listing listing) {
        return listingRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(listing.getTitle());
                    existing.setDescription(listing.getDescription());
                    existing.setPrice(listing.getPrice());
                    existing.setLocation(listing.getLocation());
                    existing.setStatus(listing.getStatus());
                    existing.setBedrooms(listing.getBedrooms());
                    existing.setBathrooms(listing.getBathrooms());
                    existing.setAreaSqft(listing.getAreaSqft());
                    return listingRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Listing not found: " + id));
    }

    public void deleteListing(Long id) {
        listingRepository.deleteById(id);
    }

    public List<Customer> findAllCustomers() {
        return customerRepository.findAll();
    }

    public Customer createCustomer(Customer customer) {
        return customerRepository.save(customer);
    }
}