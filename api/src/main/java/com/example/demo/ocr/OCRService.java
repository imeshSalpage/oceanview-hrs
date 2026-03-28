package com.example.demo.ocr;

import com.google.cloud.vision.v1.*;
import com.google.api.gax.rpc.FixedHeaderProvider;
import com.google.protobuf.ByteString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class OCRService {

    @Value("${google.vision.api.key:}")
    private String apiKey;

    public String extractText(MultipartFile file) throws IOException {
        List<AnnotateImageRequest> requests = new ArrayList<>();

        ByteString imgBytes = ByteString.copyFrom(file.getBytes());
        Image img = Image.newBuilder().setContent(imgBytes).build();
        Feature feat = Feature.newBuilder().setType(Feature.Type.TEXT_DETECTION).build();
        
        AnnotateImageRequest request = AnnotateImageRequest.newBuilder()
                .addFeatures(feat)
                .setImage(img)
                .build();
        requests.add(request);

        ImageAnnotatorSettings.Builder settingsBuilder = ImageAnnotatorSettings.newBuilder();
        
        if (apiKey != null && !apiKey.isEmpty()) {
            settingsBuilder.setHeaderProvider(
                FixedHeaderProvider.create("X-Goog-Api-Key", apiKey)
            );
        }

        try (ImageAnnotatorClient client = ImageAnnotatorClient.create(settingsBuilder.build())) {
            BatchAnnotateImagesResponse response = client.batchAnnotateImages(requests);
            List<AnnotateImageResponse> responses = response.getResponsesList();

            for (AnnotateImageResponse res : responses) {
                if (res.hasError()) {
                    return "Error: " + res.getError().getMessage();
                }
                return res.getFullTextAnnotation().getText();
            }
        }
        return "No text found";
    }
}
