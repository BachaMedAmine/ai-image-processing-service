import { Injectable } from '@nestjs/common';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import * as path from 'path';

@Injectable()
export class AiService {
    private fileManager: GoogleAIFileManager;
    private genAI: GoogleGenerativeAI;

    constructor() {
        this.fileManager = new GoogleAIFileManager('AIzaSyCpQnD-W3wAKXfH2RJBPGWhSG334ClS85U');
        this.genAI = new GoogleGenerativeAI('AIzaSyCpQnD-W3wAKXfH2RJBPGWhSG334ClS85U');
    }

    async processImage(image: Express.Multer.File) {
        try {
            // Upload the image to Google AI
            const uploadResult = await this.fileManager.uploadFile(
                path.join(__dirname, '../..', 'uploads', image.filename),
                {
                    mimeType: "image/jpeg",
                    displayName: "car image",
                },
            );

            const schema = {

                type: SchemaType.OBJECT,
                properties: {
                    brand: {
                        type: SchemaType.STRING,
                        nullable: false,
                    },
                    model: {
                        type: SchemaType.STRING,
                        nullable: false,
                    },
                    year: {
                        type: SchemaType.STRING,
                        nullable: false,
                    },
                    engine: {
                        type: SchemaType.STRING,
                        nullable: false,
                    },

                },
                required: ["brand", "model", "year"]
            }


            // Use the Generative AI model to analyze the uploaded image
            const model = this.genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            const result = await model.generateContent([
                "return the brand of the car and the full model of the car",
                {
                    fileData: {
                        fileUri: uploadResult.file.uri,
                        mimeType: uploadResult.file.mimeType,
                    },
                },
            ]);

            // Log the response to inspect its format
            console.log('AI Response:', result.response);

            // Access the relevant data from the response object
            // This is an example; adjust according to the actual structure of result.response
            if (result.response && typeof result.response.text === 'function') {
                const responseText = await result.response.text(); // Ensure this is awaited if it's a Promise
                // const validJsonString = responseText.replace(/'/g, '"');

                // Try to parse the valid JSON string

                return JSON.parse(responseText)
            } else {
                throw new Error('Invalid response structure from AI model.');
            }

        } catch (error) {
            console.error('Could not find the car:', error);
            throw error;
        }
    }
}