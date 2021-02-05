import { WalletMessages } from '../types'

const wallet: WalletMessages = {
  'wallet.nav.deposits': 'Einzahlungen',
  'wallet.nav.bonds': 'Bonds',
  'wallet.nav.poolshares': 'Poolanteile',
  'wallet.column.name': 'Name',
  'wallet.column.ticker': 'Ticker',
  'wallet.column.balance': 'Saldo',
  'wallet.action.send': 'Senden',
  'wallet.action.upgrade': 'Upgrade',
  'wallet.action.receive': 'Empfangen',
  'wallet.action.remove': 'Wallet entfernen',
  'wallet.action.unlock': 'Entsperren',
  'wallet.action.import': 'Importieren',
  'wallet.action.create': 'Erstellen',
  'wallet.action.connect': 'Verbinden',
  'wallet.action.deposit': 'Einzahlung',
  'wallet.connect.instruction': 'Bitte verbinde Deine Wallet',
  'wallet.unlock.title': 'Wallet entsperren',
  'wallet.unlock.instruction': 'Bitte entsperre Deine Wallet',
  'wallet.unlock.phrase': 'Bitte gebe Deine Phrase ein',
  'wallet.unlock.error': 'Die Wallet konnte nicht entsperrt werden. Bitte überprüfe Dein Passwort und versuche es .',
  'wallet.imports.keystore.select': 'Wähle Keystore-Datei',
  'wallet.imports.keystore.upload': 'Wähle Deine Keystore-Datei zum Import',
  'wallet.imports.phrase': 'Phrase',
  'wallet.imports.wallet': 'Importiere eine bestehende Wallet',
  'wallet.imports.enterphrase': 'Phrase eingeben',
  'wallet.imports.error.instance': 'Es konnte keine Instanz vom Client erstellt werden',
  'wallet.imports.error.keystore.load': 'Ungültige Keystore-Datei',
  'wallet.imports.error.keystore.import': 'Ungültiges Passwort',
  'wallet.phrase.error.valueRequired': 'Bitte Phrase angeben',
  'wallet.phrase.error.invalid': 'Invalide Phrase',
  'wallet.phrase.error.import': 'Error beim Importieren der Phrase',
  'wallet.txs.last90days': 'Transaktionen der vergangenen 90 Tage',
  'wallet.empty.phrase.import': 'Importiere eine bestehende Wallet mit Guthaben',
  'wallet.empty.phrase.create': 'Erstelle eine neue Wallet und füge ein Guthaben hinzu',
  'wallet.create.copy.phrase': 'Phrase kopieren',
  'wallet.create.title': 'Erstelle eine Wallet',
  'wallet.create.enter.phrase': 'Gebe die Phrase richtig ein',
  'wallet.create.words.click': 'Klicke die Wörter in der richtigen Reihenfolge',
  'wallet.create.creating': 'Erstelle eine Wallet ...',
  'wallet.create.error': 'Fehler beim Abspeichern der Phrase',
  'wallet.receive.address.error': 'Keine Addresse für den Empfang vorhanden',
  'wallet.receive.address.errorQR': 'Error beim Rendern des QR Codes: {error}',
  'wallet.send.success': 'Transaktion war erfolgreich.',
  'wallet.send.fastest': 'Am Schnellsten',
  'wallet.send.fast': 'Schnell',
  'wallet.send.average': 'Mittel',
  'wallet.errors.balancesFailed': 'Fehler beim Laden der Guthaben. {errorMsg} (API Id: {apiId})',
  'wallet.errors.asset.notExist': 'Asset ({asset}) existiert nicht',
  'wallet.errors.address.empty': 'Keine Addresse angegeben',
  'wallet.errors.address.invalid': 'Addresse ist nicht valide',
  'wallet.errors.address.couldNotFind': 'Addresse vom {pool} Pool konnte nicht gefunden werden',
  'wallet.errors.amount.shouldBeNumber': 'Der eingegebene Wert sollte eine Nummer sein',
  'wallet.errors.amount.shouldBeGreaterThan': 'Der eingegebene Betrag sollte höher als {amount} betragen',
  'wallet.errors.amount.shouldBeLessThanBalance': 'Der eingegebene Betrag sollte nicht höher als Dein Guthaben sein',
  'wallet.errors.amount.shouldBeLessThanBalanceAndFee':
    'Der eingegebene Wert sollte nicht höher als Dein Guthaben abzgl. Gebühren sein',
  'wallet.errors.fee.notCovered': 'Die Gebühren sind nicht über Dein Guthaben ({balance}) gedeckt',
  'wallet.errors.invalidChain': 'Invalide Chain: {chain}',
  'wallet.password.confirmation': 'Password bestätigen',
  'wallet.password.confirmation.pending': 'Überprüfe Passwort',
  'wallet.password.confirmation.error': 'Passwort ist falsch',
  'wallet.password.repeat': 'Passwort wiederholen',
  'wallet.password.mismatch': 'Passwort stimmt nicht überein',
  'wallet.upgrade.pending': 'Upgraden',
  'wallet.upgrade.success': 'Updgrade erfolgreich',
  'wallet.upgrade.error.loadPoolAddress': 'Addresse vom {pool} Pool konnte nicht geladen werden',
  'wallet.upgrade.error': 'Upgrade error',
  'wallet.upgrade.feeError': 'Die Upgrade Gebühr {fee} ist nicht über Dein Guthaben {balance} gedeckt',
  'wallet.validations.lessThen': 'Der eingegebene Betrag sollte weniger als {value} betragen',
  'wallet.validations.graterThen': 'Der eingegebene Betrag sollte höher als {amount} betragen',
  'wallet.validations.shouldNotBeEmpty': 'Der eingegebene Werte sollte nicht leer sein.'
}

export default wallet
