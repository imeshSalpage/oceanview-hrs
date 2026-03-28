package com.example.demo.ocr;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ocr")
@CrossOrigin(origins = "*")
public class OCRController {

    @Autowired
    private OCRService ocrService;

    @PostMapping("/extract")
    public ResponseEntity<?> extractID(@RequestParam("file") MultipartFile file) {
        try {
            String extractedText = ocrService.extractText(file);
            return ResponseEntity.ok(Map.of("text", extractedText));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
