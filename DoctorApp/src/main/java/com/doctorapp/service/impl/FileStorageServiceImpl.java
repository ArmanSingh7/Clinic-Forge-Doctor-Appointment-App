package com.doctorapp.service.impl;

import com.doctorapp.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir:./uploads/documents}")
    private String uploadDir;

    private Path storageLocation;

    @PostConstruct
    public void init() {
        storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String storedName = UUID.randomUUID().toString() + extension;

        try {
            Path targetLocation = storageLocation.resolve(storedName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return storedName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + originalName, e);
        }
    }

    @Override
    public Resource loadFile(String storedFileName) {
        try {
            Path filePath = storageLocation.resolve(storedFileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + storedFileName);
        } catch (MalformedURLException e) {
            throw new RuntimeException("File not found: " + storedFileName, e);
        }
    }

    @Override
    public void deleteFile(String storedFileName) {
        try {
            Path filePath = storageLocation.resolve(storedFileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete file: " + storedFileName, e);
        }
    }
}
