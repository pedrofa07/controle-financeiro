
import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet
} from 'react-native';

export default function BotaoPrincipal({
  titulo,
  onPress,
  carregando = false,
  desabilitado = false,
  estilo
}) {
  return (
    <Pressable
      style={[estilos.botao, estilo]}
      onPress={onPress}
      disabled={carregando || desabilitado}
    >
      {carregando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={estilos.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
