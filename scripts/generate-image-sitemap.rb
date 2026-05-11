#!/usr/bin/env ruby

# Image Sitemap Generator for 3mpwrapp
# Generates an image sitemap for better indexing in Google Images
# 
# Usage: ruby scripts/generate-image-sitemap.rb
# 
# Scans all built HTML pages for images with alt text and creates
# an image sitemap following Google's image sitemap spec:
# https://developers.google.com/search/docs/advanced/sitemaps/image-sitemaps

require 'nokogiri'
require 'uri'
require 'fileutils'

SITE_URL = ENV['SITE_URL'] || 'https://3mpwrapp.ca'
SITE_DIR = File.join(__dir__, '..', '_site')
OUTPUT_FILE = File.join(SITE_DIR, 'image-sitemap.xml')

# Track statistics
stats = {
  pages_scanned: 0,
  pages_with_images: 0,
  total_images: 0,
  images_with_alt: 0,
  images_without_alt: 0
}

# Image data structure
images_by_page = {}

puts "🖼️  Generating Image Sitemap for #{SITE_URL}"
puts "═" * 50
puts

# Find all HTML files
html_files = Dir.glob(File.join(SITE_DIR, '**', '*.html'))
puts "Found #{html_files.length} HTML files"
puts

html_files.each do |file|
  stats[:pages_scanned] += 1
  
  # Get page URL
  page_path = file.sub(SITE_DIR, '').sub('/index.html', '/').sub('.html', '')
  page_url = URI.join(SITE_URL, page_path).to_s
  
  # Parse HTML
  html = File.read(file)
  doc = Nokogiri::HTML(html)
  
  # Find all images
  images = doc.css('img')
  next if images.empty?
  
  stats[:pages_with_images] += 1
  images_by_page[page_url] = []
  
  images.each do |img|
    src = img['src']
    next unless src
    
    # Skip external images, data URIs, and SVGs
    next if src.start_with?('http://', 'https://', 'data:', '//')
    next if src.end_with?('.svg')
    
    # Make URL absolute
    image_url = if src.start_with?('/')
      URI.join(SITE_URL, src).to_s
    else
      # Relative path
      base_path = File.dirname(page_path)
      URI.join(SITE_URL, File.join(base_path, src)).to_s
    end
    
    # Get alt text
    alt_text = img['alt']&.strip
    
    # Get title and caption if available
    title = img['title']&.strip
    caption = img.parent.css('figcaption').first&.text&.strip
    
    stats[:total_images] += 1
    
    if alt_text && !alt_text.empty?
      stats[:images_with_alt] += 1
      
      images_by_page[page_url] << {
        url: image_url,
        title: title || alt_text,
        caption: caption,
        alt: alt_text
      }
    else
      stats[:images_without_alt] += 1
      # Skip images without alt text (likely decorative)
    end
  end
  
  # Remove page if no valid images
  images_by_page.delete(page_url) if images_by_page[page_url].empty?
end

puts "Statistics:"
puts "  Pages scanned: #{stats[:pages_scanned]}"
puts "  Pages with images: #{stats[:pages_with_images]}"
puts "  Total images found: #{stats[:total_images]}"
puts "  Images with alt text: #{stats[:images_with_alt]}"
puts "  Images without alt (skipped): #{stats[:images_without_alt]}"
puts

# Generate XML
builder = Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
  xml.urlset(xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
             'xmlns:image' => 'http://www.google.com/schemas/sitemap-image/1.1') do
    
    images_by_page.each do |page_url, images|
      xml.url do
        xml.loc page_url
        
        images.each do |img|
          xml['image'].image do
            xml['image'].loc img[:url]
            
            if img[:title] && !img[:title].empty?
              xml['image'].title img[:title]
            end
            
            if img[:caption] && !img[:caption].empty?
              xml['image'].caption img[:caption]
            elsif img[:alt] && !img[:alt].empty? && img[:alt] != img[:title]
              # Use alt as caption if different from title
              xml['image'].caption img[:alt]
            end
          end
        end
      end
    end
  end
end

# Write to file
File.write(OUTPUT_FILE, builder.to_xml)

puts "✅ Image sitemap generated:"
puts "   #{OUTPUT_FILE}"
puts "   #{images_by_page.length} pages"
puts "   #{stats[:images_with_alt]} images"
puts

# Update robots.txt to reference image sitemap
robots_file = File.join(SITE_DIR, 'robots.txt')
if File.exist?(robots_file)
  robots_content = File.read(robots_file)
  
  unless robots_content.include?('image-sitemap.xml')
    robots_content += "\nSitemap: #{SITE_URL}/image-sitemap.xml\n"
    File.write(robots_file, robots_content)
    puts "✅ Updated robots.txt to include image sitemap"
  end
else
  puts "⚠️  Warning: robots.txt not found. Add this line manually:"
  puts "   Sitemap: #{SITE_URL}/image-sitemap.xml"
end

puts
puts "📊 Image Sitemap Quality Report:"
puts "   Coverage: #{((stats[:images_with_alt].to_f / stats[:total_images]) * 100).round(1)}% of images have alt text"
puts

if stats[:images_without_alt] > 0
  puts "⚠️  #{stats[:images_without_alt]} images are missing alt text and were excluded."
  puts "   Run: grep -r '<img' _site/ | grep -v 'alt=' to find them."
  puts
end

puts "Next steps:"
puts "  1. Submit #{SITE_URL}/image-sitemap.xml to Google Search Console"
puts "  2. Monitor indexing status in Search Console > Sitemaps"
puts "  3. Re-run this script after adding new images"
puts

puts "✅ Done!"
