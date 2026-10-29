import type { BuilderConfig, FieldConfig } from '../types/schema';
const field = (name: string, type: FieldConfig['type'], required = true, description = ''): FieldConfig => ({
  id: crypto.randomUUID(), name, type, description, required, nullable: false, enumValues: '',
  itemType: 'string', children: [], defaultValue: ''
});
export const presets: { label: string; description: string; config: BuilderConfig }[] = [
  { label: 'User profile', description: 'A structured user record.', config: { name: 'UserProfile', description: 'A user profile returned by an AI model.', additionalProperties: false, fields: [field('id','string'), field('name','string'), field('email','string'), field('age','integer',false)] } },
  { label: 'Product information', description: 'Product catalog data.', config: { name: 'ProductInfo', description: 'Structured product details.', additionalProperties: false, fields: [field('name','string'), field('price','number'), field('inStock','boolean'), field('category','string',false)] } },
  { label: 'Blog article', description: 'A content draft structure.', config: { name: 'BlogArticle', description: 'A generated blog article.', additionalProperties: false, fields: [field('title','string'), field('summary','string'), field('body','string'), field('tags','array',false)] } },
  { label: 'Sentiment analysis', description: 'Classify text sentiment.', config: { name: 'SentimentResult', description: 'Sentiment classification output.', additionalProperties: false, fields: [{...field('sentiment','string'), enumValues:'positive, neutral, negative'}, field('confidence','number'), field('explanation','string',false)] } },
  { label: 'Text extraction', description: 'Extract entities from text.', config: { name: 'TextExtraction', description: 'Entities extracted from source text.', additionalProperties: false, fields: [field('sourceText','string'), field('entities','array'), field('language','string',false)] } },
  { label: 'Customer support', description: 'A support response object.', config: { name: 'SupportResponse', description: 'Structured customer support reply.', additionalProperties: false, fields: [field('response','string'), field('resolved','boolean'), {...field('priority','string'), enumValues:'low, medium, high'}] } },
  { label: 'API response', description: 'A standard API response envelope.', config: { name: 'ApiResponse', description: 'A predictable API response.', additionalProperties: false, fields: [field('success','boolean'), field('message','string'), field('requestId','string',false)] } }
];
