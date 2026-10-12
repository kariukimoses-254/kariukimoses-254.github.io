package com.fullstack.repository;

import com.fullstack.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStatus(String status);
    List<Listing> findByPriceBetween(Double min, Double max);
    List<Listing> findByLocationContaining(String location);
}