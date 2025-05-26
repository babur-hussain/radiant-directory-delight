
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact <span className="text-brand-orange">Us</span></h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get in touch with us for any questions, collaborations, or support.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <Input id="name" placeholder="Your name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <Input id="email" type="email" placeholder="Your email" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                <Input id="subject" placeholder="Message subject" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <Textarea id="message" placeholder="Your message" rows={5} />
              </div>
              <Button className="w-full">Send Message</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Get in touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-brand-orange" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">contact@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-brand-orange" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand-orange" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">123 Business St, City, State 12345</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
