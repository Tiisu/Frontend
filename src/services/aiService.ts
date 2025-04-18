import { ProjectData } from '@/lib/blockchain';

// Define the AI response interface
export interface AIResponse {
  text: string;
  isLoading: boolean;
  error?: string;
}

// Define the types of AI explanations we can generate
export type ExplanationType = 
  | 'summary' 
  | 'technical' 
  | 'applications' 
  | 'future' 
  | 'custom';

// Mock AI responses for different explanation types
const mockResponses: Record<ExplanationType, (project: ProjectData, customQuery?: string) => string> = {
  summary: (project) => `
    # Summary of "${project.title}"
    
    This project explores ${project.title.toLowerCase()} with a focus on practical applications and theoretical foundations. 
    
    The work demonstrates a comprehensive understanding of the subject matter and contributes to the field by providing 
    new insights into ${project.description.split(' ').slice(0, 5).join(' ')}...
    
    The methodology employed is rigorous and the results are significant for future research in this area.
  `,
  
  technical: (project) => `
    # Technical Analysis of "${project.title}"
    
    From a technical perspective, this project implements several key technologies and methodologies:
    
    1. **Core Technologies**: The project utilizes advanced frameworks and tools relevant to ${project.title.split(' ').slice(-2).join(' ')}.
    
    2. **Implementation Details**: The architecture follows a modular approach with clear separation of concerns.
    
    3. **Technical Challenges**: Several complex problems were addressed, particularly in the areas of 
       ${project.description.split(' ').slice(3, 8).join(' ')}.
    
    4. **Performance Considerations**: The solution demonstrates efficient resource utilization and scalability.
    
    The technical approach is sound and demonstrates a deep understanding of the underlying principles.
  `,
  
  applications: (project) => `
    # Practical Applications of "${project.title}"
    
    This project has several real-world applications:
    
    1. **Industry Applications**: The findings could be applied in sectors such as healthcare, finance, or technology.
    
    2. **Commercial Potential**: There are opportunities for commercialization through product development or licensing.
    
    3. **Social Impact**: The work addresses challenges related to ${project.description.split(' ').slice(5, 10).join(' ')}.
    
    4. **Integration Possibilities**: The project could be integrated with existing systems to enhance functionality.
    
    The practical value of this research extends beyond academic interest and shows potential for broader impact.
  `,
  
  future: (project) => `
    # Future Directions for "${project.title}"
    
    Building on this project, several future research directions emerge:
    
    1. **Extended Research**: Further investigation into ${project.description.split(' ').slice(-5).join(' ')} would yield additional insights.
    
    2. **Technological Advancements**: As technology evolves, new tools could enhance the approach taken in this project.
    
    3. **Collaborative Opportunities**: This work opens doors for interdisciplinary collaboration with fields such as 
       ${Math.random() > 0.5 ? 'data science and artificial intelligence' : 'biomedical engineering and healthcare informatics'}.
    
    4. **Long-term Vision**: The ultimate goal would be to develop a comprehensive framework that addresses all aspects of 
       ${project.title.toLowerCase()}.
    
    This project lays a solid foundation for continued exploration and innovation in the field.
  `,
  
  custom: (project, customQuery) => `
    # Response to: "${customQuery}"
    
    Regarding "${project.title}":
    
    ${customQuery?.includes('how') 
      ? `The project approaches this by implementing a systematic methodology that addresses the core challenges in ${project.description.split(' ').slice(0, 7).join(' ')}...`
      : customQuery?.includes('why') 
      ? `The motivation behind this aspect of the project stems from the need to address critical gaps in current understanding of ${project.title.toLowerCase()}.`
      : customQuery?.includes('what') 
      ? `This component of the project refers to the ${project.description.split(' ').slice(3, 10).join(' ')}... which is essential for achieving the project's objectives.`
      : `The project's approach to this question involves a careful consideration of multiple factors related to ${project.title.toLowerCase()}, particularly focusing on aspects mentioned in the project description such as ${project.description.split(' ').slice(5, 12).join(' ')}...`
    }
    
    Additional context: The project was completed in ${project.year} and belongs to the field of study indicated in its departmental classification.
  `
};

// Function to generate AI explanations
export const generateAIExplanation = async (
  project: ProjectData, 
  type: ExplanationType, 
  customQuery?: string
): Promise<AIResponse> => {
  // In a real implementation, this would call an actual AI API
  // For now, we'll simulate a network delay and return mock responses
  
  try {
    // Simulate network delay (1-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate the response based on the explanation type
    const responseText = mockResponses[type](project, customQuery);
    
    return {
      text: responseText,
      isLoading: false
    };
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return {
      text: '',
      isLoading: false,
      error: 'Failed to generate explanation. Please try again later.'
    };
  }
};
