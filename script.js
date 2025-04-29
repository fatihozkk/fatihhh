// PDF.js worker'ı ayarla
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// Veritabanı simülasyonu
const modelDatabase = {
    'model1': 'Model A',
    'model2': 'Model B',
    'model3': 'Model C'
};

// Makine öğrenmesi modeli için basit bir sınıf
class PDFAnalyzer {
    constructor() {
        this.learningData = {
            structure: [],
            features: [],
            spelling: [],
            format: []
        };
    }

    async analyzePDF(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            textContent += content.items.map(item => item.str).join(' ');
        }

        return this.performAnalysis(textContent);
    }

    performAnalysis(text) {
        const results = {
            structure: this.checkStructure(text),
            features: this.checkFeatures(text),
            spelling: this.checkSpelling(text),
            format: this.checkFormat(text),
            modelMatch: this.matchModel(text)
        };

        // Öğrenme verilerini güncelle
        this.updateLearningData(results);

        return results;
    }

    checkStructure(text) {
        // Yapı kontrolü
        const hasTitle = text.length > 0;
        const hasContent = text.split(' ').length > 10;
        const hasSections = text.includes('\n\n');

        return {
            hasTitle,
            hasContent,
            hasSections,
            score: (hasTitle + hasContent + hasSections) / 3
        };
    }

    checkFeatures(text) {
        // Özellik kontrolü
        const hasImages = text.includes('Image');
        const hasTables = text.includes('Table');
        const hasReferences = text.includes('References');

        return {
            hasImages,
            hasTables,
            hasReferences,
            score: (hasImages + hasTables + hasReferences) / 3
        };
    }

    checkSpelling(text) {
        // Basit imla kontrolü (örnek)
        const commonMistakes = {
            'teh': 'the',
            'adn': 'and',
            'thier': 'their'
        };

        let mistakes = 0;
        for (const [wrong, correct] of Object.entries(commonMistakes)) {
            if (text.includes(wrong)) mistakes++;
        }

        return {
            mistakes,
            score: 1 - (mistakes / Object.keys(commonMistakes).length)
        };
    }

    checkFormat(text) {
        // Format kontrolü
        const hasProperSpacing = text.includes('  ');
        const hasProperLineBreaks = text.includes('\n\n');
        const hasProperPunctuation = /[.!?]/.test(text);

        return {
            hasProperSpacing,
            hasProperLineBreaks,
            hasProperPunctuation,
            score: (hasProperSpacing + hasProperLineBreaks + hasProperPunctuation) / 3
        };
    }

    matchModel(text) {
        // Model eşleştirme
        for (const [key, value] of Object.entries(modelDatabase)) {
            if (text.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }
        return 'Bilinmeyen Model';
    }

    updateLearningData(results) {
        // Öğrenme verilerini güncelle
        this.learningData.structure.push(results.structure.score);
        this.learningData.features.push(results.features.score);
        this.learningData.spelling.push(results.spelling.score);
        this.learningData.format.push(results.format.score);
    }
}

// UI işlemleri
document.addEventListener('DOMContentLoaded', () => {
    const pdfFile = document.getElementById('pdfFile');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');
    const analysisResults = document.getElementById('analysisResults');

    const analyzer = new PDFAnalyzer();

    analyzeBtn.addEventListener('click', async () => {
        if (!pdfFile.files.length) {
            alert('Lütfen bir PDF dosyası seçin');
            return;
        }

        resultsDiv.style.display = 'block';
        loadingDiv.classList.remove('d-none');
        analysisResults.innerHTML = '';

        try {
            const results = await analyzer.analyzePDF(pdfFile.files[0]);
            displayResults(results);
        } catch (error) {
            analysisResults.innerHTML = `<div class="alert alert-danger">Hata: ${error.message}</div>`;
        } finally {
            loadingDiv.classList.add('d-none');
        }
    });

    function displayResults(results) {
        let html = '';

        // Yapı analizi
        html += createSection('Yapı Analizi', results.structure);
        
        // Özellik analizi
        html += createSection('Özellik Analizi', results.features);
        
        // İmla analizi
        html += createSection('İmla Analizi', results.spelling);
        
        // Format analizi
        html += createSection('Format Analizi', results.format);
        
        // Model eşleştirme
        html += `
            <div class="analysis-section">
                <h3>Model Eşleştirme</h3>
                <div class="result-item success">
                    Eşleşen Model: ${results.modelMatch}
                </div>
            </div>
        `;

        analysisResults.innerHTML = html;
    }

    function createSection(title, data) {
        let html = `
            <div class="analysis-section">
                <h3>${title}</h3>
        `;

        for (const [key, value] of Object.entries(data)) {
            if (key !== 'score') {
                const status = value ? 'success' : 'error';
                html += `
                    <div class="result-item ${status}">
                        ${key}: ${value}
                    </div>
                `;
            }
        }

        html += `
            <div class="result-item ${getScoreClass(data.score)}">
                Skor: ${(data.score * 100).toFixed(2)}%
            </div>
        </div>`;

        return html;
    }

    function getScoreClass(score) {
        if (score >= 0.8) return 'success';
        if (score >= 0.5) return 'warning';
        return 'error';
    }
}); 