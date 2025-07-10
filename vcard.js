// vCard generation utility
class VCardGenerator {
    constructor() {
        this.version = '3.0';
    }

    generate(contactData) {
        const {name, lastName, firstName, company, title, phone, email, website, address, photo} = contactData;
        
        // vCard format lines
        const vCardLines = [
            'BEGIN:VCARD',
            `VERSION:${this.version}`,
        ];

        // Full name (required)
        if (name || lastName || firstName) {
            const fullName = name || `${lastName} ${firstName}`.trim();
            const last = lastName || '';
            const first = firstName || '';
            
            vCardLines.push(`FN:${fullName}`);
            vCardLines.push(`N:${last};${first};;;`);
        }

        // Organization
        if (company) {
            vCardLines.push(`ORG:${company}`);
        }

        // Title/Position
        if (title) {
            vCardLines.push(`TITLE:${title}`);
        }

        // Phone number
        if (phone) {
            // Clean phone number
            const cleanPhone = phone.replace(/[^\d\-\+\(\)\s]/g, '');
            vCardLines.push(`TEL;TYPE=WORK,VOICE:${cleanPhone}`);
        }

        // Email
        if (email) {
            vCardLines.push(`EMAIL;TYPE=WORK:${email}`);
        }

        // Website
        if (website) {
            // Ensure URL has protocol
            const url = website.match(/^https?:\/\//) ? website : `https://${website}`;
            vCardLines.push(`URL:${url}`);
        }

        // Address
        if (address) {
            // Format: ADR;TYPE=WORK:;;street;city;region;postal-code;country
            vCardLines.push(`ADR;TYPE=WORK:;;${address};;;;`);
        }

        // Photo
        if (photo) {
            // Remove data:image/jpeg;base64, prefix if present
            const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, '');
            vCardLines.push(`PHOTO;ENCODING=BASE64;TYPE=JPEG:${base64Data}`);
        }

        // End vCard
        vCardLines.push('END:VCARD');

        return vCardLines.join('\r\n');
    }

    download(contactData, filename) {
        const vCardContent = this.generate(contactData);
        
        // Create blob
        const blob = new Blob([vCardContent], {
            type: 'text/vcard;charset=utf-8'
        });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${contactData.name || 'contact'}.vcf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Cleanup
        URL.revokeObjectURL(url);
    }

    // Validate contact data
    isValid(contactData) {
        // At least name (full name, lastName, or firstName) or company should be present
        return !!(contactData.name || contactData.lastName || contactData.firstName || contactData.company);
    }

    // Resize and optimize image for vCard
    static resizeImageForVCard(canvas, maxWidth = 600, maxHeight = 600, quality = 0.9) {
        
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = canvas;
        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }
        
        // Create new canvas with resized dimensions
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = width;
        resizedCanvas.height = height;
        const resizedCtx = resizedCanvas.getContext('2d');
        
        // Enable image smoothing for better quality
        resizedCtx.imageSmoothingEnabled = true;
        resizedCtx.imageSmoothingQuality = 'high';
        
        // Draw original image onto resized canvas
        resizedCtx.drawImage(canvas, 0, 0, width, height);
        
        // Return as base64 data URL
        return resizedCanvas.toDataURL('image/jpeg', quality);
    }
}

// Export for use in other files
window.VCardGenerator = VCardGenerator;