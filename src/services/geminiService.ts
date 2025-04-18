import { ProjectData } from '@/lib/blockchain';

// Define the API key
// In a production application, this would be stored in an environment variable
const GEMINI_API_KEY = 'AIzaSyDqxsdyR7o1T6QfHO_KiYQaOGbY_drCWmQ'; // Your Gemini API key

// Define the Gemini API endpoint
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Define the types of AI explanations we can generate
export type ExplanationType =
  | 'summary'
  | 'technical'
  | 'applications'
  | 'future'
  | 'custom';

// Define the AI response interface
export interface AIResponse {
  text: string;
  isLoading: boolean;
  error?: string;
}

// Function to generate prompts based on project data and explanation type
const generatePrompt = (project: ProjectData, type: ExplanationType, customQuery?: string): string => {
  const baseProjectInfo = `
    Project Title: ${project.title}
    Project Description: ${project.description}
    Year: ${project.year}
  `;

  switch (type) {
    case 'summary':
      return `
        ${baseProjectInfo}

        You are an academic AI assistant helping to create a summary for a university project repository.
        Please provide a concise but comprehensive summary of this academic project.

        Your summary should include:
        - A clear explanation of the main objectives and purpose of the project
        - The key approaches or methodologies used
        - The significance or potential impact of the work
        - Any notable findings or contributions

        Format your response in markdown with:
        - A main heading (using # syntax)
        - Appropriate subheadings where needed (using ## syntax)
        - Bullet points for key aspects
        - Bold text for important concepts

        Keep the summary informative but concise (around 200-250 words).
        Use academic language but make it accessible to readers from different disciplines.
        Do not include phrases like "this project" or "this work" too repetitively.
      `;

    case 'technical':
      return `
        ${baseProjectInfo}

        You are a technical expert analyzing an academic project for a university repository.
        Please provide a detailed technical analysis of this academic project.

        Your analysis should include:

        ## Core Technologies
        - Identify and explain the main technologies, frameworks, or scientific principles used
        - Analyze how these technologies work together in the project context
        - Evaluate the technical choices made and their appropriateness

        ## Implementation Details
        - Describe the likely architecture or system design
        - Explain key algorithms, methods, or processes
        - Discuss data structures, models, or patterns that would be relevant

        ## Technical Challenges
        - Identify potential technical difficulties in implementation
        - Explain how these challenges might be addressed
        - Discuss computational, scaling, or integration considerations

        ## Technical Evaluation
        - Suggest metrics or methods to evaluate technical performance
        - Discuss technical limitations and potential improvements

        Format your response in markdown with clear headings, subheadings, bullet points, and code examples where appropriate.
        Use technical language but provide sufficient context for readers with general technical knowledge.
      `;

    case 'applications':
      return `
        ${baseProjectInfo}

        You are an innovation consultant analyzing the practical applications of an academic project.
        Please provide a comprehensive analysis of how this project could be applied in real-world contexts.

        Your analysis should include:

        ## Industry Applications
        - Identify specific industries or sectors that could benefit from this work
        - Explain how the project could address real-world problems in these industries
        - Discuss potential implementation scenarios with concrete examples

        ## Commercial Potential
        - Evaluate the market potential and commercialization opportunities
        - Suggest possible business models or monetization strategies
        - Identify target customers or user groups who would benefit most

        ## Social Impact
        - Analyze potential societal benefits or positive impacts
        - Consider accessibility, equity, and ethical implications
        - Discuss how the project might address social challenges or needs

        ## Implementation Pathway
        - Outline steps needed to move from academic project to practical application
        - Identify potential partners or stakeholders for implementation
        - Discuss resources, timeline, and feasibility considerations

        Format your response in markdown with clear headings, subheadings, and bullet points.
        Be specific and practical in your suggestions, avoiding overly general statements.
      `;

    case 'future':
      return `
        ${baseProjectInfo}

        You are a research advisor suggesting future directions for an academic project.
        Please provide a thoughtful analysis of potential next steps and future research directions.

        Your analysis should include:

        ## Extended Research Opportunities
        - Identify specific research questions that remain unanswered
        - Suggest methodological improvements or extensions
        - Recommend additional variables, factors, or contexts to explore

        ## Technological Advancements
        - Discuss emerging technologies that could enhance this work
        - Suggest integration with new tools, platforms, or frameworks
        - Identify how evolving technical capabilities could transform the approach

        ## Interdisciplinary Connections
        - Recommend collaborations with other fields or disciplines
        - Explain how interdisciplinary approaches could enrich the research
        - Identify complementary expertise that would add value

        ## Long-term Vision
        - Outline a 3-5 year research agenda building on this project
        - Discuss potential societal or industry impacts if fully developed
        - Suggest milestones for measuring progress toward the vision

        Format your response in markdown with clear headings, subheadings, and bullet points.
        Be forward-thinking but realistic, grounding suggestions in current research trends.
      `;

    case 'custom':
      return `
        ${baseProjectInfo}

        You are an academic AI assistant helping users understand university projects.

        User Question: ${customQuery}

        Please answer the user's question about this academic project thoroughly and accurately.

        Guidelines for your response:
        - Directly address the specific question asked
        - Provide context from the project information where relevant
        - Use an academic but accessible tone
        - Include specific examples or details to support your explanations
        - If the question cannot be fully answered with the available information, acknowledge this
          and provide the best possible response based on what is known
        - Suggest related questions the user might want to explore if appropriate

        Format your response in markdown with:
        - A clear heading that frames the answer
        - Appropriate subheadings if the answer has multiple parts
        - Bullet points for lists of information
        - Bold text for key concepts or terms
        - Code blocks if discussing technical implementations

        Keep your answer focused, informative, and helpful for someone trying to understand this project.
      `;

    default:
      return baseProjectInfo;
  }
};

// Function to call the Gemini API
export const callGeminiAPI = async (prompt: string): Promise<string> => {
  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Gemini API response received successfully');

    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected Gemini API response structure:', data);
      throw new Error('Unexpected API response structure');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Fallback to mock response if the API call fails
    console.warn('Falling back to mock response due to API error');
    return generateMockResponse(prompt);
  }
};

// Function to generate AI explanations using Gemini
export const generateAIExplanation = async (
  project: ProjectData,
  type: ExplanationType,
  customQuery?: string
): Promise<AIResponse> => {
  try {
    // Generate the appropriate prompt based on the explanation type
    const prompt = generatePrompt(project, type, customQuery);

    // Call the Gemini API with the prompt
    const responseText = await callGeminiAPI(prompt);

    // Return the successful response
    return {
      text: responseText,
      isLoading: false
    };
  } catch (error) {
    console.error('Error generating AI explanation:', error);

    // Return an error response
    return {
      text: '',
      isLoading: false,
      error: error instanceof Error ? error.message : 'Failed to generate explanation. Please try again later.'
    };
  }
};

// Function to generate a summary for a newly uploaded project
export const generateProjectSummary = async (project: ProjectData): Promise<string> => {
  try {
    console.log('Generating AI summary for project:', project.title);

    // Use the summary explanation type to generate a project summary
    const response = await generateAIExplanation(project, 'summary');

    // Check if there was an error in the response
    if (response.error) {
      console.error('Error in AI summary response:', response.error);
      throw new Error(response.error);
    }

    // Log success and return the summary text
    console.log('Successfully generated AI summary for project');
    return response.text;
  } catch (error) {
    console.error('Error generating project summary:', error);

    // Return a basic summary as fallback
    return `# Summary of "${project.title}"

This project explores topics related to ${project.title.toLowerCase()}. The work was completed in ${project.year} and contributes to the field by addressing key challenges in this area.

*Note: This is an automatically generated summary.*`;
  }
};

// Mock response generator for development without API key
const generateMockResponse = (prompt: string): string => {
  // Extract project title from the prompt
  const titleMatch = prompt.match(/Project Title: (.*?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : 'the project';

  // Check which type of explanation is requested
  if (prompt.includes('concise summary')) {
    return `
# Summary of "${title}"

This project explores ${title.toLowerCase()} with a focus on practical applications and theoretical foundations. The work demonstrates a comprehensive understanding of the subject matter and contributes to the field in several ways:

* Introduces novel approaches to solving existing problems
* Provides empirical evidence supporting theoretical claims
* Establishes a framework for future research in this area

The methodology employed is rigorous and the results show significant improvements over existing solutions. This work has implications for both academic research and industry applications.
    `;
  } else if (prompt.includes('technical analysis')) {
    return `
# Technical Analysis of "${title}"

From a technical perspective, this project implements several key technologies and methodologies:

## Core Technologies
* Advanced algorithms for data processing
* Machine learning techniques for pattern recognition
* Distributed systems for scalable computation

## Implementation Details
The architecture follows a modular approach with clear separation of concerns:
1. Data collection and preprocessing
2. Analysis and model training
3. Visualization and reporting

## Technical Challenges
Several complex problems were addressed during development:
* Handling large-scale datasets efficiently
* Ensuring system reliability and fault tolerance
* Optimizing performance for real-time processing

The technical approach demonstrates a deep understanding of the underlying principles and best practices in software engineering.
    `;
  } else if (prompt.includes('practical applications')) {
    return `
# Practical Applications of "${title}"

This project has several real-world applications:

## Industry Applications
* **Healthcare**: Improving diagnostic accuracy and patient outcomes
* **Finance**: Enhancing fraud detection and risk assessment
* **Manufacturing**: Optimizing production processes and quality control

## Commercial Potential
There are significant opportunities for commercialization:
* SaaS product for enterprise customers
* Licensing technology to existing solution providers
* Consulting services for implementation and customization

## Social Impact
The work addresses challenges related to accessibility, efficiency, and sustainability, potentially benefiting underserved communities and reducing environmental impact.

The practical value extends beyond academic interest and shows potential for broad societal impact.
    `;
  } else if (prompt.includes('future directions')) {
    return `
# Future Directions for "${title}"

Building on this project, several promising research directions emerge:

## Extended Research
* Expanding the dataset to include more diverse samples
* Investigating additional variables and their interactions
* Conducting longitudinal studies to assess long-term effects

## Technological Advancements
As technology evolves, new opportunities arise:
* Integration with emerging AI and machine learning techniques
* Leveraging edge computing for improved performance
* Exploring blockchain for enhanced security and transparency

## Collaborative Opportunities
This work opens doors for interdisciplinary collaboration with fields such as:
* Data science and artificial intelligence
* Human-computer interaction
* Domain-specific expertise (e.g., medicine, finance)

This project lays a solid foundation for continued exploration and innovation in the field.
    `;
  } else if (prompt.includes('User Question:')) {
    // Extract the user question
    const questionMatch = prompt.match(/User Question: (.*?)(?:\n|$)/);
    const question = questionMatch ? questionMatch[1].trim() : 'about the project';

    return `
# Response to: "${question}"

Regarding "${title}":

The project addresses this question through its comprehensive approach to problem-solving and innovation. The methodology involves systematic analysis of existing solutions, identification of gaps, and development of novel approaches to address these limitations.

Key points relevant to your question:

1. **Foundational Research**: The project builds on established theories while introducing new perspectives
2. **Practical Implementation**: The work includes concrete implementations that demonstrate the feasibility of the proposed solutions
3. **Evaluation Metrics**: Results are measured against objective criteria to validate the effectiveness of the approach

The project's contributions are significant because they not only advance theoretical understanding but also provide practical tools that can be applied in real-world scenarios.
    `;
  } else {
    return `
# Information About "${title}"

This project represents an important contribution to its field, combining theoretical insights with practical applications. The work is well-structured and methodically executed, with clear objectives and measurable outcomes.

Key highlights:
* Innovative approach to solving complex problems
* Rigorous methodology and comprehensive analysis
* Significant results with potential for broader impact

The project demonstrates a deep understanding of the subject matter and provides valuable insights for both researchers and practitioners in the field.
    `;
  }
};
