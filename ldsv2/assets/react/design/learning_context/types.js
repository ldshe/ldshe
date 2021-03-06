export const StateName = {
    LEARNING_CONTEXT: 'learningContext',
}

const prefix = 'learning_context_';

export const Action = {
    RESET: prefix + 'reset',
    RESTORE: prefix + 'restore',
    FIELD_CHANGE: prefix + 'field_change',
    UPDATE_TEACHING_STUDY_TIME: prefix + 'update_teaching_study_time',
    PARTIAL_UPDATE: prefix + 'partial_update',
};

export const SubjectAutoSuggests = [
    'e-Leadership',
    'e-Learning',
    'Learning technology design',
    'Arts and Humanities',
    'Design and Creativity',
    'Film and Theatre',
    'History',
    'Literature and Writing',
    'Music and Dance',
    'Philosophy and Ethics',
    'Religion and Culture',
    'Visual Arts and Photography',
    'Biology and Life Science',
    'Bioinformatics',
    'Biology',
    'Business and Management',
    'Business Analytics and Intelligence',
    'Business Essentials',
    'Business Strategy',
    'Economics and Finance',
    'Entrepreneurship',
    'Industry Specific',
    'Leadership and Management',
    'Marketing',
    'Computer Science',
    'Artificial Intelligence',
    'Data Science and Analysis',
    'Databases',
    'Hardware and Operating System',
    'Information Technology',
    'Networks and Computer Security',
    'Software Engineering and Testing',
    'Theoretical Computer Science and Algorithms',
    'Education and Teaching',
    'Language Learning',
    'Office Productivity',
    'Online Education and Course Development',
    'Personal and Career Development',
    'Teacher Development',
    'Test Preparation',
    'Engineering',
    'Architecture',
    'Civil and Environmental Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Health and Medicine',
    'Disease and Medicine',
    'Nutrition and Wellness',
    'Public and Global Health',
    'Mathematics',
    'Algebra and Geometry',
    'Calculus and Mathematical Analysis',
    'Foundations of Mathematics',
    'Logics',
    'Statistics and Probability',
    'Physical Science',
    'Chemistry',
    'Energy and Earth Sciences',
    'Environmental Science and Sustainability',
    'Physics and Astronomy',
    'Research Methods',
    'Programming',
    'Design and Product',
    'Game Development',
    'Mobile and Web Development',
    'Programming Languages',
    'Software Development',
    'Social Science',
    'Anthropology',
    'Law',
    'Politics',
    'Psychology',
    'Sociology',
];

export const LearningModes = [
    {name: 'Blended', value: 'blended'},
    {name: 'Online', value: 'online'},
    {name: 'Face-to-face only', value: 'face-to-face_only'},
];

export const CourseTypes = [
    {name: 'Core', value: 'core'},
    {name: 'Specialist', value: 'specialist'},
    {name: 'Electives', value: 'electives'},
    {name: 'Independent project', value: 'independent_project'},
    {name: 'Group project', value: 'group_project'},
    {name: 'Dissertation', value: 'dissertation'},
    {name: 'MOOC', value: 'mooc'},
];

export const Prerequisites = [
    {name: 'Not applicable', value: 'not_applicable'},
    {name: "Bachelor's degree", value: 'bachelor_degree'},
    {name: 'University Entrance Requirements', value: 'university_entrance_requirements'},
];
