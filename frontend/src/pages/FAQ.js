import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ExpandMore, Help } from '@mui/icons-material';

const FAQ = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const faqs = [
    {
      question: 'How do I book a parking space?',
      answer: 'To book a parking space, simply search for available spaces in your desired location, select a suitable spot, choose your parking duration, and complete the payment process. You can do this through our website or mobile app.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept various payment methods including credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through our payment gateway partners.',
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel your booking up to 1 hour before your scheduled parking time. A cancellation fee may apply depending on the timing of your cancellation. Refunds will be processed to your original payment method.',
    },
    {
      question: 'How do I extend my parking duration?',
      answer: 'You can extend your parking duration through the app or website. Simply go to your active bookings, select the booking you want to extend, and choose the additional time needed. Payment for the extended duration will be processed immediately.',
    },
    {
      question: 'What happens if I arrive late for my booking?',
      answer: 'Your parking space will be reserved for 15 minutes after your scheduled arrival time. If you arrive after this grace period, your booking may be cancelled, and the space may be made available to other users.',
    },
    {
      question: 'How do I list my parking space?',
      answer: 'To list your parking space, register as a parking space owner, provide details about your space including location, size, and availability, and set your pricing. Once approved, your space will be available for users to book.',
    },
    {
      question: 'What are the requirements for listing a parking space?',
      answer: 'To list a parking space, you need to provide proof of ownership or authorization, valid identification, and ensure your space meets safety and accessibility standards. The space should be clearly marked and well-maintained.',
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach our customer support team 24/7 through the contact form on our website, email at support@parkease.com, or by calling our helpline at +91-XXXXXXXXXX. We also offer in-app chat support.',
    },
    {
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We comply with data protection regulations and never share your information with third parties without your consent.',
    },
    {
      question: 'Do you offer monthly parking subscriptions?',
      answer: 'Yes, we offer monthly parking subscriptions at discounted rates. You can choose from various subscription plans based on your needs. Contact our support team or check the website for current subscription offers.',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F8F9FF 0%, #E8ECFF 100%)',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 6,
          }}
        >
          <Help
            sx={{
              fontSize: 48,
              color: 'primary.main',
              mb: 2,
            }}
          />
          <Typography
            variant={isMobile ? 'h3' : 'h2'}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              textAlign: 'center',
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              textAlign: 'center',
              maxWidth: '600px',
            }}
          >
            Find answers to common questions about our parking services
          </Typography>
        </Box>

        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                '&:before': {
                  display: 'none',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(26, 47, 111, 0.02)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  backgroundColor: 'white',
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQ; 