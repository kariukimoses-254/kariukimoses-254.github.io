# frozen_string_literal: true

class InMemoryStore
  def initialize
    @reviews = [
      {
        id: 1,
        property_id: 101,
        reviewer_name: 'Ethan Walker',
        rating: 5,
        comment: 'Outstanding property, worth every penny!',
        created_at: Time.now - (2 * 24 * 60 * 60)
      },
      {
        id: 2,
        property_id: 102,
        reviewer_name: 'Maya Robinson',
        rating: 4,
        comment: 'Great location and excellent facilities.',
        created_at: Time.now - (1 * 24 * 60 * 60)
      }
    ]
  end

  def all_reviews
    @reviews
  end

  def find_review(id)
    @reviews.find { |r| r[:id] == id }
  end

  def create_review(attrs)
    review = {
      id: @reviews.length + 1,
      property_id: attrs['property_id'] || 0,
      reviewer_name: attrs['reviewer_name'] || 'Anonymous',
      rating: attrs['rating'] || 5,
      comment: attrs['comment'] || '',
      created_at: Time.now
    }
    @reviews << review
    review
  end

  def market_stats
    {
      average_price: 842_500,
      total_listings: 42,
      median_price: 655_000,
      trending_cities: %w[Austin Nashville Denver],
      growth_rate: 4.2,
      updated_at: Time.now.iso8601
    }
  end
end