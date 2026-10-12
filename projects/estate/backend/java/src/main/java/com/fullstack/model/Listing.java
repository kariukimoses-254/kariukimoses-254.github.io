package com.fullstack.model;

import jakarta.persistence.*;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String location;
    private String status;

    @Column(name = "bedrooms")
    private Integer bedrooms;

    @Column(name = "bathrooms")
    private Integer bathrooms;

    @Column(name = "area_sqft")
    private Double areaSqft;

    public Listing() {}

    public Listing(String title, String description, Double price, String location,
                   String status, Integer bedrooms, Integer bathrooms, Double areaSqft) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.location = location;
        this.status = status;
        this.bedrooms = bedrooms;
        this.bathrooms = bathrooms;
        this.areaSqft = areaSqft;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    public Double getAreaSqft() { return areaSqft; }
    public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }
}