// Certificate ZIP Generator
// Dynamically creates a ZIP file from all certificates in assets/certs/

async function downloadAllCertifications() {
    try {
        // Show loading indicator
        const loadingMsg = document.createElement('div');
        loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a365d;color:white;padding:20px 30px;border-radius:10px;z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
        loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating ZIP file...';
        document.body.appendChild(loadingMsg);

        // Load JSZip library dynamically if not already loaded
        if (typeof JSZip === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        const zip = new JSZip();
        
        // List of certificate files in assets/certs/
        // These files are automatically discovered from the assets/certs/ directory
        // CERTIFICATIONS ONLY.
        // Employment references (Arbeitszeugnisse) are deliberately NOT bundled here:
        // they carry third-party signatories' names and titles, which must not be
        // distributed via a public one-click download. Share those on request instead.
        const certFiles = [
            'AssociateCloudEngineer20251202-31.pdf',
            'AccentureCertification.pdf',
            'CertificateOfCompletion_HtmlEssentialTraining.pdf',
            'CertificateOfCompletion_LearningSqlProgramming.pdf',
            'CertificateOfCompletion_MakingVideo2TeachSomething(1).pdf'
        ];

        let filesAdded = 0;

        // Fetch and add each certificate file to the ZIP
        for (const filename of certFiles) {
            try {
                const response = await fetch(`./assets/certs/${encodeURIComponent(filename)}`);
                if (response.ok) {
                    const blob = await response.blob();
                    zip.file(filename, blob);
                    filesAdded++;
                } else {
                    console.warn(`Could not fetch ${filename}: ${response.status}`);
                }
            } catch (error) {
                console.warn(`Error fetching ${filename}:`, error);
            }
        }

        if (filesAdded === 0) {
            throw new Error('No certificate files could be loaded');
        }

        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Create download link
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all-certifications.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Remove loading indicator
        document.body.removeChild(loadingMsg);

        // Show success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#4ade80;color:white;padding:20px 30px;border-radius:10px;z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
        successMsg.innerHTML = '<i class="fas fa-check-circle"></i> ZIP file downloaded successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
            if (document.body.contains(successMsg)) {
                document.body.removeChild(successMsg);
            }
        }, 2000);

    } catch (error) {
        console.error('Error creating ZIP file:', error);
        
        // Remove loading indicator if it exists
        const loadingMsg = document.querySelector('div[style*="Creating ZIP file"]');
        if (loadingMsg) {
            document.body.removeChild(loadingMsg);
        }

        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#ef4444;color:white;padding:20px 30px;border-radius:10px;z-index:10000;box-shadow:0 4px 20px rgba(0,0,0,0.3);';
        errorMsg.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error creating ZIP file. Please try again.';
        document.body.appendChild(errorMsg);
        setTimeout(() => {
            if (document.body.contains(errorMsg)) {
                document.body.removeChild(errorMsg);
            }
        }, 3000);
    }
}

