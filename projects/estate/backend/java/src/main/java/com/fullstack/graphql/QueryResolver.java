package com.fullstack.graphql;

import com.fullstack.model.Customer;
import com.fullstack.model.Listing;
import com.fullstack.service.EstateService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class QueryResolver implements GraphQLQueryResolver {

    private final EstateService estateService;

    public QueryResolver(EstateService estateService) {
        this.estateService = estateService;
    }

    public List<Listing> listings() {
        return estateService.findAllListings();
    }

    public Listing listing(Long id) {
        return estateService.findListing(id);
    }

    public List<Customer> customers() {
        return estateService.findAllCustomers();
    }
}