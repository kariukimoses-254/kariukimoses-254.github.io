# frozen_string_literal: true

require 'sinatra'
require 'sinatra/json'
require 'json'
require 'rack/cors'
require_relative 'app/services/in_memory_store'

set :port, 8082
set :bind, '0.0.0.0'
set :default_content_type, :json

use Rack::Cors do
  allow do
    origins '*'
    resource '*', headers: :any, methods: %i[get post put delete options]
  end
end

store = InMemoryStore.new

get '/api/health' do
  json(
    service: 'Ruby Sinatra API',
    database: 'In-memory store (demo)',
    health: 'ok'
  )
end

get '/api/reviews' do
  json store.all_reviews
end

get '/api/reviews/:id' do
  review = store.find_review(params[:id].to_i)
  halt 404, json(error: 'Review not found') unless review

  json review
end

post '/api/reviews' do
  body = JSON.parse(request.body.read) rescue {}
  review = store.create_review(body)
  status 201
  json review
end

get '/api/market-stats' do
  json store.market_stats
end

post '/graphql' do
  payload = JSON.parse(request.body.read) rescue {}
  query = payload['query'] || ''

  if query.include?('reviews')
    json data: { reviews: store.all_reviews }
  elsif query.include?('marketStats')
    json data: { marketStats: store.market_stats }
  elsif query.include?('addReview')
    result = store.create_review(JSON.parse(payload.fetch('variables', '{}')) || {})
    json data: { addReview: result }
  else
    json errors: [{ message: 'Unsupported GraphQL operation' }]
  end
end

not_found do
  json error: 'Not found'
end