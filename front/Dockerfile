# Use an official Nginx image as a parent image
FROM nginx:alpine

# Copy the build output to replace the default Nginx contents
COPY dist/magic-marmite-101/browser /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 34449
EXPOSE 34449

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
