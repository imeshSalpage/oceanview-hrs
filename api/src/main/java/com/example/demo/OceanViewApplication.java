package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OceanViewApplication {

	public static void main(String[] args) {
		SpringApplication.run(OceanViewApplication.class, args);
	}

}
