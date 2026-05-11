#!/usr/bin/env ruby
# Script to find all images without alt text in the Jekyll site

require 'nokogiri'
require 'json'

SITE_DIR = '_site'
OUTPUT_FILE = 'reports/images-without-alt.json'

puts "\n🔍 Scanning for images without alt text..."

# Scan all HTML files
html_files = Dir.glob(File.join(SITE_DIR, '**', '*.html'))
puts "📄 Found #{html_files.length} HTML files to scan"

images_without_alt = []
stats = {
  total_files: 0,
  files_with_issues: 0,
  total_images: 0,
  images_without_alt: 0,
  images_with_empty_alt: 0,
  decorative_images: 0
}

html_files.each do |file|
  stats[:total_files] += 1
  
  doc = Nokogiri::HTML(File.read(file))
  images = doc.css('img')
  
  next if images.empty?
  
  file_has_issues = false
  
  images.each do |img|
    stats[:total_images] += 1
    src = img['src']
    alt = img['alt']
    
    # Skip external images, SVGs, data URIs
    next if src.nil?
    next if src.start_with?('http://', 'https://', '//')
    next if src.end_with?('.svg')
    next if src.start_with?('data:')
    
    # Check for missing alt attribute
    if alt.nil?
      stats[:images_without_alt] += 1
      file_has_issues = true
      
      images_without_alt << {
        file: file.gsub(SITE_DIR + '/', ''),
        src: src,
        issue: 'missing_alt',
        context: img.to_html[0..200]
      }
    elsif alt.strip.empty?
      # Empty alt is OK for decorative images
      stats[:decorative_images] += 1
    end
  end
  
  stats[:files_with_issues] += 1 if file_has_issues
end

# Create reports directory if it doesn't exist
Dir.mkdir('reports') unless Dir.exist?('reports')

# Write results to JSON
File.write(OUTPUT_FILE, JSON.pretty_generate({
  scan_date: Time.now.iso8601,
  stats: stats,
  images_without_alt: images_without_alt
}))

puts "\n📊 Scan Results:"
puts "   Total files scanned: #{stats[:total_files]}"
puts "   Files with issues: #{stats[:files_with_issues]}"
puts "   Total images: #{stats[:total_images]}"
puts "   ❌ Images without alt: #{stats[:images_without_alt]}"
puts "   ✅ Decorative images (empty alt): #{stats[:decorative_images]}"
puts "\n📝 Report saved to: #{OUTPUT_FILE}"

if stats[:images_without_alt] > 0
  puts "\n🔍 First 10 images without alt text:"
  images_without_alt.take(10).each_with_index do |img, i|
    puts "   #{i+1}. #{img[:file]}"
    puts "      Source: #{img[:src]}"
  end
end

puts "\n✅ Scan complete!"
