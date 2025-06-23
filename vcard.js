// vCard generation utility
class VCardGenerator {
    constructor() {
        this.version = '3.0';
    }

    generate(contactData) {
        const {name, company, title, phone, email, website, address} = contactData;
        
        // vCard format lines
        const vCardLines = [
            'BEGIN:VCARD',
            `VERSION:${this.version}`,
        ];

        // Full name (required)
        if (name) {
            // Split name into parts for FN and N fields
            const nameParts = name.trim().split(/\s+/);
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
            const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || '';
            
            vCardLines.push(`FN:${name}`);
            vCardLines.push(`N:${lastName};${firstName};;;`);
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
        // At least name or company should be present
        return !!(contactData.name || contactData.company);
    }
}

// Export for use in other files
window.VCardGenerator = VCardGenerator;