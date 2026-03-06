package com.example.demo.help;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/help")
public class HelpController {

    @GetMapping
    public Map<String, String> help() {
        return Map.of(
                "name", "Ocean View Resort API",
                "status", "ok");
    }
}
