import { type FC, useState } from 'react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpModal: FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const [activeSection, setActiveSection] = useState<string | null>('nav');

    if (!isOpen) return null;

    const sections = [
        {
            id: 'nav',
            title: 'Comment utiliser l\'application (Fonctionnalités)',
            icon: 'fas fa-mouse-pointer',
            content: (
                <ul>
                    <li><strong>Sélecteur de Thème :</strong> Changez l'angle d'analyse (Vue neutre vs Secteurs spécifiques).</li>
                    <li><strong>Filtres :</strong> Ciblez une Région ou un Département pour isoler les données.</li>
                    <li><strong>Recherche :</strong> Tapez le nom d'une localité pour y accéder instantanément.</li>
                    <li><strong>Comparaison :</strong> Cliquez sur une zone sur la carte, puis "Ajouter à la comparaison" pour analyser plusieurs zones côte à côte.</li>
                    <li><strong>Statistiques :</strong> Le bouton "Stats" ouvre un panneau avec des graphiques Top 10.</li>
                </ul>
            )
        },
        {
            id: 'logic',
            title: 'Comprendre la visualisation (Logique & Mécanismes)',
            icon: 'fas fa-lightbulb',
            content: (
                <ul>
                    <li><strong>Couleurs de Production :</strong> Plus la zone est sombre, plus le volume produit est important.</li>
                    <li><strong>Couleurs de Secteurs :</strong> <span style={{color: '#2ecc71'}}>Vert</span> (Agri), <span style={{color: '#f39c12'}}>Orange</span> (Élevage), <span style={{color: '#3498db'}}>Bleu</span> (Pêche).</li>
                    <li><strong>KPIs Dynamiques :</strong> Les chiffres en haut se recalculent en temps réel selon vos filtres.</li>
                    <li><strong>Zoom Administratif :</strong> En sélectionnant une région, la carte affiche automatiquement ses départements.</li>
                </ul>
            )
        }
    ];

    return (
        <div className="modal-overlay modal-overlay--active" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal help-modal">
                <div className="modal__header">
                    <h2 className="modal__title"><i className="fas fa-question-circle"></i> Centre d'Aide</h2>
                    <button className="modal__close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal__body">
                    <div className="help-accordion">
                        {sections.map((section) => (
                            <div key={section.id} className={`help-section ${activeSection === section.id ? 'active' : ''}`}>
                                <div className="help-section__header" onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}>
                                    <span><i className={section.icon}></i> {section.title}</span>
                                    <i className={`fas fa-chevron-${activeSection === section.id ? 'up' : 'down'}`}></i>
                                </div>
                                {activeSection === section.id && (
                                    <div className="help-section__content animate-fadeIn">
                                        {section.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal__footer">
                    <button className="btn btn-primary" onClick={onClose}>J'ai compris</button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;