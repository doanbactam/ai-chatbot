# AI Providers Integration Guide

This project now supports multiple AI providers through the Vercel AI SDK, allowing you to choose from various state-of-the-art language models.

## Supported Providers

### 🤖 XAI (xAI)
- **Grok-2 Vision**: Primary model with vision capabilities
- **Grok-3 Mini Beta**: Advanced reasoning model
- **Capabilities**: Text, Vision, Reasoning, Code

### ⚡ OpenAI
- **GPT-4**: Most capable model for complex tasks
- **GPT-3.5 Turbo**: Fast and efficient for most tasks
- **Capabilities**: Text, Reasoning, Code

### 🔮 Anthropic
- **Claude 3.5 Sonnet**: Balanced performance and speed
- **Claude 3 Haiku**: Fastest Claude model for quick responses
- **Capabilities**: Text, Reasoning, Code

### 🔍 Google
- **Gemini Pro**: Google's most capable AI model
- **Capabilities**: Text, Reasoning, Code

### 🌪️ Mistral
- **Mixtral 8x7B**: High-performance open-source model
- **Mistral 7B**: Efficient and fast open-source model
- **Capabilities**: Text, Code

### 🎯 Cohere
- **Command R+**: Cohere's most advanced model
- **Capabilities**: Text, Reasoning, Code

## Setup Instructions

### 1. Install Dependencies

The required packages are already included in `package.json`:

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env.local` file in your project root and add your API keys:

```env
# XAI (existing)
XAI_API_KEY=your_xai_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Google
GOOGLE_API_KEY=your_google_api_key

# Mistral
MISTRAL_API_KEY=your_mistral_api_key

# Cohere
COHERE_API_KEY=your_cohere_api_key
```

### 3. Get API Keys

#### OpenAI
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or sign in
3. Navigate to API Keys section
4. Create a new API key

#### Google
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to API Keys section
4. Create a new API key

#### Mistral
1. Visit [Mistral AI Platform](https://console.mistral.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

#### Cohere
1. Visit [Cohere Platform](https://cohere.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

## Usage

### Model Selection

Users can select different AI models through the model selector dropdown in the chat interface. The available models depend on the user's account type:

- **Guest Users**: Limited to basic models (20 messages/day)
- **Regular Users**: Access to all models (100 messages/day)
- **Premium Users**: Full access with higher limits (500 messages/day)

### Provider Status

You can check provider configuration status by:
- Reviewing your environment variables
- Testing model availability through the model selector
- Checking console logs for configuration errors

### Capability-Based Features

Different models support different capabilities:

- **Text**: Basic text generation and conversation
- **Vision**: Image understanding and analysis
- **Reasoning**: Advanced logical reasoning
- **Code**: Programming and code generation

## Architecture

### Provider Configuration

Each provider is configured in `lib/ai/provider-config.ts` with optimized parameters:

- Temperature, Top-P, Top-K settings
- Maximum token limits
- Provider-specific configurations

### Model Routing

The system automatically routes requests to the appropriate provider based on the selected model ID in `lib/ai/providers.ts`.

### Entitlements

User access is controlled through `lib/ai/entitlements.ts`, which defines:
- Daily message limits
- Available model IDs
- Token limits per message

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure all required environment variables are set
2. **Rate Limits**: Check your provider's rate limiting policies
3. **Model Unavailable**: Verify the model name and provider configuration

### Validation

Use the `validateProviderConfig()` function to check your configuration:

```typescript
import { validateProviderConfig } from '@/lib/ai/provider-config';

const config = validateProviderConfig();
if (!config.isValid) {
  console.log('Missing API keys:', config.missingKeys);
}
```

### Provider Status Check

You can check provider configuration by reviewing environment variables and testing model availability through the model selector.

## Performance Optimization

### Token Management

- Models are configured with appropriate token limits
- User entitlements control maximum tokens per message
- Streaming responses for better user experience

### Provider Selection

- Choose models based on your specific use case
- Consider cost vs. capability trade-offs
- Use reasoning models for complex tasks

## Cost Considerations

Different providers have different pricing models:

- **OpenAI**: Pay-per-token with GPT-4 being more expensive
- **Anthropic**: Pay-per-token with Claude 3.5 Sonnet being premium
- **Google**: Pay-per-token with competitive pricing
- **Mistral**: Open-source models with API access costs
- **Cohere**: Pay-per-token with enterprise features

## Security

- API keys are stored as environment variables
- Never commit API keys to version control
- Use `.env.local` for local development
- Consider using Vercel's environment variable management for production

## Contributing

To add new providers:

1. Install the provider package from `@ai-sdk/`
2. Add configuration to `provider-config.ts`
3. Update `providers.ts` with the new provider
4. Add models to `models.ts`
5. Update entitlements and UI components

## Support

For issues related to:
- **AI SDK**: Check [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- **Provider APIs**: Refer to respective provider documentation
- **Project Setup**: Check the main project README