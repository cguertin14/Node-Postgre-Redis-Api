import path from 'path';
import i18n from 'i18n';
import { app } from '../server';

/**
 * Locale object.
 */
i18n.configure({
    // Available locales
    locales: ['en', 'fr'],
    // Path of the locale files
    directory: path.join(__dirname + '/../locales'),
    // Default locale
    defaultLocale: 'en',
    // Locale key
    cookie: 'locale',
    // File extension
    extension: '.json',
});

/**
 * Locale module
 */
export default i18n;

/**
 * __ function (translate)
 */
export const { __ } = i18n;