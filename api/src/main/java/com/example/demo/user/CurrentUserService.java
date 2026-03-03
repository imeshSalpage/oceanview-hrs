package com.example.demo.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.demo.common.ResourceNotFoundException;
import com.example.demo.security.UserPrincipal;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return userRepository.findByUsername(principal.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new ResourceNotFoundException("User not found");
    }
}
