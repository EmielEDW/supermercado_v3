import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import emailjs from 'emailjs-com';

interface ContactSlideProps {
  isActive: boolean;
  isMobile: boolean;
}

const EMAILJS_SERVICE_ID = 'service_25kako1';
const EMAILJS_TEMPLATE_ID = 'template_ar7l1wd';
const EMAILJS_PUBLIC_KEY = 'GePK_ewBJq6OCNS1I';

const ContactSlide = ({ isActive, isMobile }: ContactSlideProps) => {
  const slideRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const content = contentRef.current;

    if (content) {
      gsap.set(content.children, { opacity: 0, y: 30 });
      gsap.to(content.children, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
      });
    }
  }, [isActive]);

  // Adjust underline width to match title width
  useEffect(() => {
    const titleEl = titleRef.current;
    const underline = underlineRef.current;
    if (titleEl && underline) {
      const titleWidth = titleEl.offsetWidth;
      underline.style.width = `${titleWidth}px`;
    }
  }, []);

  // Title with underline component
  const TitleWithUnderline = () => (
    <div className="mb-4 md:mb-6 text-center">
      <h2 
        ref={titleRef}
        className="text-3xl md:text-4xl font-bold tracking-wide text-gray-900 mb-1 inline-block" 
        style={{ fontFamily: 'VT323, monospace' }}
      >
        CONTACT.
      </h2>
      <div 
        ref={underlineRef}
        className="text-gray-400 text-sm md:text-base tracking-widest overflow-hidden whitespace-nowrap mx-auto"
        style={{ fontFamily: 'VT323, monospace' }}
      >
        ================================================================
      </div>
    </div>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div
        ref={slideRef}
        id="contact"
        className="slide flex flex-col bg-white pt-14 overflow-hidden"
      >
        {/* Content - scrollable */}
        <div className="w-full px-4 flex-1 overflow-y-auto py-4">
          <div ref={contentRef} className="max-w-md mx-auto">
            <TitleWithUnderline />
            
            <p
              className="text-base leading-relaxed text-gray-600 mb-4 text-justify"
              style={{ fontFamily: 'VT323, monospace' }}
            >
              <span className="text-[#c41e3a] font-bold">AUPA.</span> Wij bieden maatwerk voor elk evenement. SUPERMERCADO staat ook altijd open voor leuke samenwerkingen en pop-ups. Vul het formulier in en wij nemen contact met je op. <span className="text-[#c41e3a] font-bold">EUSKADI WITH LOVE.</span>
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Naam"
                value={formData.name}
                onChange={handleChange}
                className="form-input py-3"
                required
                disabled={isSubmitting}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="form-input py-3"
                required
                disabled={isSubmitting}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Telefoon"
                value={formData.phone}
                onChange={handleChange}
                className="form-input py-3"
                disabled={isSubmitting}
              />
              <textarea
                name="message"
                placeholder="Bericht"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="form-input resize-none py-3"
                disabled={isSubmitting}
              />
              
              <button 
                type="submit" 
                className="submit-btn w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'VERSTUREN...' : 'VERSTUUR'}
              </button>

              {submitStatus === 'success' && (
                <p className="text-green-600 text-center text-base" style={{ fontFamily: 'VT323, monospace' }}>
                  Bedankt! Je bericht is verzonden.
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-red-600 text-center text-base" style={{ fontFamily: 'VT323, monospace' }}>
                  Er ging iets mis. Probeer het opnieuw.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Footer - bigger and bold */}
        <div className="bg-gray-50 py-5 px-4 border-t border-gray-100 mt-auto">
          <div className="text-center footer-text text-base font-bold" style={{ fontFamily: 'VT323, monospace' }}>
            <p>Lange Kruisstraat 18, 9000 Gent BE</p>
            <p>info@superrrrmercado.be | +32 478 09 83 83 | BE1011.539.358</p>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div
      ref={slideRef}
      id="contact"
      className="slide flex flex-col bg-white pt-14 md:pt-16"
    >
      {/* Main Content - centered */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto py-8">
        <div ref={contentRef} className="max-w-xl w-full px-8">
          <TitleWithUnderline />
          
          <p
            className="text-lg md:text-xl leading-relaxed text-gray-600 mb-8 text-justify"
            style={{ fontFamily: 'VT323, monospace' }}
          >
            <span className="text-[#c41e3a] font-bold">AUPA.</span> Wij bieden maatwerk voor elk evenement. SUPERMERCADO staat ook altijd open voor leuke samenwerkingen en pop-ups. Vul het formulier in en wij nemen contact met je op. <span className="text-[#c41e3a] font-bold">EUSKADI WITH LOVE.</span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-3 md:space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Naam"
              value={formData.name}
              onChange={handleChange}
              className="form-input py-2 md:py-3"
              required
              disabled={isSubmitting}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-input py-2 md:py-3"
              required
              disabled={isSubmitting}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefoon"
              value={formData.phone}
              onChange={handleChange}
              className="form-input py-2 md:py-3"
              disabled={isSubmitting}
            />
            <textarea
              name="message"
              placeholder="Bericht"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              className="form-input resize-none py-2 md:py-3"
              disabled={isSubmitting}
            />
            
            <button 
              type="submit" 
              className="submit-btn w-full py-3 md:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'VERSTUREN...' : 'VERSTUUR'}
            </button>

            {submitStatus === 'success' && (
              <p className="text-green-600 text-center text-lg md:text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                Bedankt! Je bericht is verzonden.
              </p>
            )}
            {submitStatus === 'error' && (
              <p className="text-red-600 text-center text-lg md:text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                Er ging iets mis. Probeer het opnieuw.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Footer - bigger and bold */}
      <div className="bg-gray-50 py-4 px-8 border-t border-gray-100 flex-shrink-0">
        <div className="flex flex-row justify-between items-center footer-text text-base font-bold" style={{ fontFamily: 'VT323, monospace' }}>
          <div>
            <p>Lange Kruisstraat 18, 9000 Gent BE</p>
          </div>
          <div className="text-right">
            <p>info@superrrrmercado.be | +32 478 09 83 83 | BE1011.539.358</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSlide;
