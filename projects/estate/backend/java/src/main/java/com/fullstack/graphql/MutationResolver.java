package com.fullstack.graphql;

import com.fullstack.model.Customer;
import com.fullstack.model.Listing;
import com.fullstack.service.EstateService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

@Component
public class MutationResolver implements GraphQLMutationResolver {

    private final EstateService estateService;

    public MutationResolver(EstateService estateService) {
        this.estateService = estateService;
    }

    public Listing createListing(Listing listing) {
        return estateService.createListing(listing);
    }

    public Listing updateListing(Long id, Listing listing) {
        return estateService.updateListing(id, listing);
    }

    public boolean deleteListing(Long id) {
        estateService.deleteListing(id);
        return true;
    }

    public Customer createCustomer(Customer customer) {
        return estateService.createCustomer(customer);
    }
}