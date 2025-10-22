#!/usr/bin/env node

/**
 * Frontend Application Reliability Metrics Analyzer
 * Quantifies and measures the reliability of the application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class ReliabilityAnalyzer {
  constructor() {
    this.metrics = {
      testCoverage: {},
      codeQuality: {},
      errorHandling: {},
      performanceFactors: {},
      securityFactors: {},
      userExperience: {},
    };
  }

  // Analyze test coverage
  analyzeTestCoverage() {
    const testFiles = this.findFiles('./client/src', '.test.tsx', '.test.ts');
    const sourceFiles = this.findFiles('./client/src', '.tsx', '.ts')
      .filter(f => !f.includes('.test.') && !f.includes('.d.ts'));

    const pageFiles = sourceFiles.filter(f => f.includes('/pages/'));
    const componentFiles = sourceFiles.filter(f => f.includes('/components/'));
    const utilFiles = sourceFiles.filter(f => f.includes('/lib/') || f.includes('/utils/'));

    const pageTests = testFiles.filter(f => f.includes('/pages/'));
    const componentTests = testFiles.filter(f => f.includes('/components/'));
    const utilTests = testFiles.filter(f => f.includes('/lib/') || f.includes('/utils/'));

    this.metrics.testCoverage = {
      totalSourceFiles: sourceFiles.length,
      totalTestFiles: testFiles.length,
      testFileRatio: (testFiles.length / sourceFiles.length * 100).toFixed(2) + '%',
      pages: {
        total: pageFiles.length,
        tested: pageTests.length,
        coverage: (pageTests.length / pageFiles.length * 100).toFixed(2) + '%'
      },
      components: {
        total: componentFiles.length,
        tested: componentTests.length,
        coverage: (componentTests.length / componentFiles.length * 100).toFixed(2) + '%'
      },
      utilities: {
        total: utilFiles.length,
        tested: utilTests.length,
        coverage: (utilTests.length / utilFiles.length * 100).toFixed(2) + '%'
      }
    };
  }

  // Analyze error handling patterns
  analyzeErrorHandling() {
    const sourceFiles = this.findFiles('./client/src', '.tsx', '.ts')
      .filter(f => !f.includes('.test.'));

    let errorHandlingCount = 0;
    let tryCount = 0;
    let catchCount = 0;
    let errorBoundaries = 0;
    let toastUsage = 0;
    let errorStateCount = 0;
    let validationCount = 0;

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      // Count error handling patterns
      tryCount += (content.match(/try\s*{/g) || []).length;
      catchCount += (content.match(/catch\s*\(/g) || []).length;
      errorBoundaries += (content.match(/ErrorBoundary/g) || []).length;
      toastUsage += (content.match(/toast\([\s\S]*?variant:\s*['"]destructive/g) || []).length;
      errorStateCount += (content.match(/useState.*[Ee]rror/g) || []).length;
      validationCount += (content.match(/validate|validation|validator/gi) || []).length;
      errorHandlingCount += (content.match(/getErrorMessage|errorInfo|handleError/g) || []).length;
    });

    this.metrics.errorHandling = {
      tryBlocks: tryCount,
      catchBlocks: catchCount,
      errorBoundaries: errorBoundaries,
      errorToasts: toastUsage,
      errorStates: errorStateCount,
      validations: validationCount,
      errorHandlers: errorHandlingCount,
      score: this.calculateErrorHandlingScore(tryCount, catchCount, errorBoundaries, toastUsage)
    };
  }

  // Analyze loading and async patterns
  analyzeAsyncPatterns() {
    const sourceFiles = this.findFiles('./client/src', '.tsx', '.ts')
      .filter(f => !f.includes('.test.'));

    let loadingStates = 0;
    let asyncAwait = 0;
    let suspense = 0;
    let optimisticUpdates = 0;
    let debounce = 0;
    let throttle = 0;

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      loadingStates += (content.match(/[iI]sLoading|loading|pending/g) || []).length;
      asyncAwait += (content.match(/async\s+/g) || []).length;
      suspense += (content.match(/Suspense/g) || []).length;
      optimisticUpdates += (content.match(/optimistic/gi) || []).length;
      debounce += (content.match(/debounce/gi) || []).length;
      throttle += (content.match(/throttle/gi) || []).length;
    });

    this.metrics.performanceFactors = {
      loadingStates,
      asyncFunctions: asyncAwait,
      suspenseBoundaries: suspense,
      optimisticUpdates,
      debouncing: debounce,
      throttling: throttle,
      score: this.calculatePerformanceScore(loadingStates, asyncAwait, suspense)
    };
  }

  // Analyze authentication and security patterns
  analyzeSecurityPatterns() {
    const sourceFiles = this.findFiles('./client/src', '.tsx', '.ts')
      .filter(f => !f.includes('.test.'));

    let authChecks = 0;
    let tokenHandling = 0;
    let inputValidation = 0;
    let sanitization = 0;
    let csrfProtection = 0;

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      authChecks += (content.match(/isAuthenticated|authCheck|requireAuth|user\?/g) || []).length;
      tokenHandling += (content.match(/token|jwt|bearer/gi) || []).length;
      inputValidation += (content.match(/required|minLength|maxLength|pattern|validate/g) || []).length;
      sanitization += (content.match(/sanitize|escape|clean/gi) || []).length;
      csrfProtection += (content.match(/csrf/gi) || []).length;
    });

    this.metrics.securityFactors = {
      authChecks,
      tokenHandling,
      inputValidation,
      sanitization,
      csrfProtection,
      score: this.calculateSecurityScore(authChecks, tokenHandling, inputValidation)
    };
  }

  // Analyze user experience patterns
  analyzeUXPatterns() {
    const sourceFiles = this.findFiles('./client/src', '.tsx', '.ts')
      .filter(f => !f.includes('.test.'));

    let feedbackMessages = 0;
    let confirmDialogs = 0;
    let emptyStates = 0;
    let skeletonLoaders = 0;
    let accessibility = 0;
    let responsive = 0;

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');

      feedbackMessages += (content.match(/toast|notification|alert|message/gi) || []).length;
      confirmDialogs += (content.match(/confirm|dialog|modal/gi) || []).length;
      emptyStates += (content.match(/empty|no\s+data|no\s+results/gi) || []).length;
      skeletonLoaders += (content.match(/skeleton|loading|pulse/gi) || []).length;
      accessibility += (content.match(/aria-|role=|alt=|title=/g) || []).length;
      responsive += (content.match(/sm:|md:|lg:|xl:|responsive/g) || []).length;
    });

    this.metrics.userExperience = {
      feedbackMessages,
      confirmDialogs,
      emptyStates,
      skeletonLoaders,
      accessibilityFeatures: accessibility,
      responsiveDesign: responsive,
      score: this.calculateUXScore(feedbackMessages, emptyStates, skeletonLoaders, accessibility)
    };
  }

  // Calculate overall reliability score
  calculateReliabilityScore() {
    const weights = {
      testCoverage: 0.35,
      errorHandling: 0.25,
      performance: 0.15,
      security: 0.15,
      userExperience: 0.10
    };

    const testScore = parseFloat(this.metrics.testCoverage.pages.coverage) || 0;
    const errorScore = this.metrics.errorHandling.score || 0;
    const perfScore = this.metrics.performanceFactors.score || 0;
    const secScore = this.metrics.securityFactors.score || 0;
    const uxScore = this.metrics.userExperience.score || 0;

    const overallScore = (
      testScore * weights.testCoverage +
      errorScore * weights.errorHandling +
      perfScore * weights.performance +
      secScore * weights.security +
      uxScore * weights.userExperience
    );

    return {
      overall: overallScore.toFixed(2),
      testCoverage: testScore.toFixed(2),
      errorHandling: errorScore.toFixed(2),
      performance: perfScore.toFixed(2),
      security: secScore.toFixed(2),
      userExperience: uxScore.toFixed(2),
      grade: this.getGrade(overallScore)
    };
  }

  // Helper functions
  findFiles(dir, ...extensions) {
    let results = [];
    try {
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(this.findFiles(filePath, ...extensions));
        } else {
          if (extensions.some(ext => filePath.endsWith(ext))) {
            results.push(filePath);
          }
        }
      });
    } catch (e) {
      // Directory doesn't exist
    }
    return results;
  }

  calculateErrorHandlingScore(tries, catches, boundaries, toasts) {
    if (tries === 0) return 0;
    const catchRatio = catches / tries;
    const hasToasts = toasts > 0 ? 20 : 0;
    const hasBoundaries = boundaries > 0 ? 20 : 0;
    return Math.min(100, catchRatio * 60 + hasToasts + hasBoundaries);
  }

  calculatePerformanceScore(loading, async, suspense) {
    const hasLoading = loading > 10 ? 40 : (loading * 4);
    const hasAsync = async > 10 ? 40 : (async * 4);
    const hasSuspense = suspense > 0 ? 20 : 0;
    return Math.min(100, hasLoading + hasAsync + hasSuspense);
  }

  calculateSecurityScore(auth, tokens, validation) {
    const hasAuth = auth > 10 ? 40 : (auth * 4);
    const hasTokens = tokens > 5 ? 30 : (tokens * 6);
    const hasValidation = validation > 10 ? 30 : (validation * 3);
    return Math.min(100, hasAuth + hasTokens + hasValidation);
  }

  calculateUXScore(feedback, empty, skeleton, a11y) {
    const hasFeedback = feedback > 10 ? 30 : (feedback * 3);
    const hasEmpty = empty > 5 ? 20 : (empty * 4);
    const hasSkeleton = skeleton > 5 ? 20 : (skeleton * 4);
    const hasA11y = a11y > 50 ? 30 : (a11y * 0.6);
    return Math.min(100, hasFeedback + hasEmpty + hasSkeleton + hasA11y);
  }

  getGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D';
    return 'F';
  }

  // Print report
  printReport() {
    console.log('\n' + colors.cyan + colors.bright + '═'.repeat(80) + colors.reset);
    console.log(colors.cyan + colors.bright + '  FRONTEND APPLICATION RELIABILITY METRICS REPORT' + colors.reset);
    console.log(colors.cyan + colors.bright + '═'.repeat(80) + colors.reset);

    // Test Coverage
    console.log('\n' + colors.blue + colors.bright + '📊 TEST COVERAGE METRICS' + colors.reset);
    console.log('─'.repeat(40));
    console.log(`Total Source Files: ${colors.bright}${this.metrics.testCoverage.totalSourceFiles}${colors.reset}`);
    console.log(`Total Test Files: ${colors.bright}${this.metrics.testCoverage.totalTestFiles}${colors.reset}`);
    console.log(`Test File Ratio: ${colors.bright}${this.metrics.testCoverage.testFileRatio}${colors.reset}`);
    console.log(`\nPages Coverage: ${this.getColorForScore(parseFloat(this.metrics.testCoverage.pages.coverage))}${this.metrics.testCoverage.pages.coverage}${colors.reset} (${this.metrics.testCoverage.pages.tested}/${this.metrics.testCoverage.pages.total})`);
    console.log(`Components Coverage: ${this.getColorForScore(parseFloat(this.metrics.testCoverage.components.coverage))}${this.metrics.testCoverage.components.coverage}${colors.reset} (${this.metrics.testCoverage.components.tested}/${this.metrics.testCoverage.components.total})`);
    console.log(`Utilities Coverage: ${this.getColorForScore(parseFloat(this.metrics.testCoverage.utilities.coverage))}${this.metrics.testCoverage.utilities.coverage}${colors.reset} (${this.metrics.testCoverage.utilities.tested}/${this.metrics.testCoverage.utilities.total})`);

    // Error Handling
    console.log('\n' + colors.magenta + colors.bright + '🛡️ ERROR HANDLING METRICS' + colors.reset);
    console.log('─'.repeat(40));
    console.log(`Try/Catch Blocks: ${colors.bright}${this.metrics.errorHandling.tryBlocks}/${this.metrics.errorHandling.catchBlocks}${colors.reset}`);
    console.log(`Error Boundaries: ${colors.bright}${this.metrics.errorHandling.errorBoundaries}${colors.reset}`);
    console.log(`Error Toast Messages: ${colors.bright}${this.metrics.errorHandling.errorToasts}${colors.reset}`);
    console.log(`Error State Handlers: ${colors.bright}${this.metrics.errorHandling.errorStates}${colors.reset}`);
    console.log(`Validation Patterns: ${colors.bright}${this.metrics.errorHandling.validations}${colors.reset}`);

    // Performance Factors
    console.log('\n' + colors.yellow + colors.bright + '⚡ PERFORMANCE FACTORS' + colors.reset);
    console.log('─'.repeat(40));
    console.log(`Loading States: ${colors.bright}${this.metrics.performanceFactors.loadingStates}${colors.reset}`);
    console.log(`Async Functions: ${colors.bright}${this.metrics.performanceFactors.asyncFunctions}${colors.reset}`);
    console.log(`Suspense Boundaries: ${colors.bright}${this.metrics.performanceFactors.suspenseBoundaries}${colors.reset}`);
    console.log(`Optimistic Updates: ${colors.bright}${this.metrics.performanceFactors.optimisticUpdates}${colors.reset}`);
    console.log(`Debouncing: ${colors.bright}${this.metrics.performanceFactors.debouncing}${colors.reset}`);

    // Security Factors
    console.log('\n' + colors.green + colors.bright + '🔒 SECURITY FACTORS' + colors.reset);
    console.log('─'.repeat(40));
    console.log(`Auth Checks: ${colors.bright}${this.metrics.securityFactors.authChecks}${colors.reset}`);
    console.log(`Token Handling: ${colors.bright}${this.metrics.securityFactors.tokenHandling}${colors.reset}`);
    console.log(`Input Validation: ${colors.bright}${this.metrics.securityFactors.inputValidation}${colors.reset}`);
    console.log(`Sanitization: ${colors.bright}${this.metrics.securityFactors.sanitization}${colors.reset}`);

    // User Experience
    console.log('\n' + colors.cyan + colors.bright + '👤 USER EXPERIENCE METRICS' + colors.reset);
    console.log('─'.repeat(40));
    console.log(`Feedback Messages: ${colors.bright}${this.metrics.userExperience.feedbackMessages}${colors.reset}`);
    console.log(`Confirmation Dialogs: ${colors.bright}${this.metrics.userExperience.confirmDialogs}${colors.reset}`);
    console.log(`Empty States: ${colors.bright}${this.metrics.userExperience.emptyStates}${colors.reset}`);
    console.log(`Skeleton Loaders: ${colors.bright}${this.metrics.userExperience.skeletonLoaders}${colors.reset}`);
    console.log(`Accessibility Features: ${colors.bright}${this.metrics.userExperience.accessibilityFeatures}${colors.reset}`);
    console.log(`Responsive Design Elements: ${colors.bright}${this.metrics.userExperience.responsiveDesign}${colors.reset}`);

    // Overall Score
    const scores = this.calculateReliabilityScore();
    console.log('\n' + colors.bright + '═'.repeat(80) + colors.reset);
    console.log(colors.bright + '📈 RELIABILITY SCORES' + colors.reset);
    console.log('═'.repeat(80));

    console.log('\n📋 Component Scores:');
    console.log(`  Test Coverage:    ${this.getColorForScore(parseFloat(scores.testCoverage))}${scores.testCoverage}%${colors.reset}`);
    console.log(`  Error Handling:   ${this.getColorForScore(parseFloat(scores.errorHandling))}${scores.errorHandling}%${colors.reset}`);
    console.log(`  Performance:      ${this.getColorForScore(parseFloat(scores.performance))}${scores.performance}%${colors.reset}`);
    console.log(`  Security:         ${this.getColorForScore(parseFloat(scores.security))}${scores.security}%${colors.reset}`);
    console.log(`  User Experience:  ${this.getColorForScore(parseFloat(scores.userExperience))}${scores.userExperience}%${colors.reset}`);

    console.log('\n' + colors.bright + '🎯 OVERALL RELIABILITY SCORE: ' +
                this.getColorForScore(parseFloat(scores.overall)) +
                colors.bright + scores.overall + '%' + colors.reset);
    console.log(colors.bright + '📊 RELIABILITY GRADE: ' +
                this.getGradeColor(scores.grade) +
                colors.bright + scores.grade + colors.reset);

    // Recommendations
    this.printRecommendations(scores);

    console.log('\n' + colors.cyan + colors.bright + '═'.repeat(80) + colors.reset + '\n');
  }

  getColorForScore(score) {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.yellow;
    return colors.red;
  }

  getGradeColor(grade) {
    if (grade.startsWith('A')) return colors.green;
    if (grade.startsWith('B')) return colors.yellow;
    if (grade.startsWith('C')) return colors.yellow;
    return colors.red;
  }

  printRecommendations(scores) {
    console.log('\n' + colors.bright + '💡 RECOMMENDATIONS FOR IMPROVEMENT:' + colors.reset);
    console.log('─'.repeat(40));

    const recommendations = [];

    if (parseFloat(scores.testCoverage) < 80) {
      recommendations.push('• Increase test coverage to at least 80% for critical paths');
    }
    if (parseFloat(scores.errorHandling) < 70) {
      recommendations.push('• Add more comprehensive error handling and recovery mechanisms');
    }
    if (parseFloat(scores.performance) < 70) {
      recommendations.push('• Implement more loading states and async handling patterns');
    }
    if (parseFloat(scores.security) < 70) {
      recommendations.push('• Strengthen authentication checks and input validation');
    }
    if (parseFloat(scores.userExperience) < 60) {
      recommendations.push('• Enhance user feedback with more skeleton loaders and empty states');
    }

    if (this.metrics.errorHandling.errorBoundaries === 0) {
      recommendations.push('• Add React Error Boundaries for graceful error recovery');
    }
    if (this.metrics.performanceFactors.suspenseBoundaries === 0) {
      recommendations.push('• Consider adding React Suspense for better loading experiences');
    }
    if (this.metrics.performanceFactors.debouncing === 0) {
      recommendations.push('• Implement debouncing for search and input fields');
    }
    if (this.metrics.securityFactors.csrfProtection === 0) {
      recommendations.push('• Add CSRF protection for state-changing operations');
    }

    if (recommendations.length === 0) {
      console.log(colors.green + '✅ Excellent! Your application meets high reliability standards!' + colors.reset);
    } else {
      recommendations.forEach(rec => console.log(colors.yellow + rec + colors.reset));
    }
  }

  run() {
    console.log(colors.cyan + '\n⏳ Analyzing application reliability...\n' + colors.reset);

    this.analyzeTestCoverage();
    this.analyzeErrorHandling();
    this.analyzeAsyncPatterns();
    this.analyzeSecurityPatterns();
    this.analyzeUXPatterns();
    this.printReport();
  }
}

// Run the analyzer
const analyzer = new ReliabilityAnalyzer();
analyzer.run();